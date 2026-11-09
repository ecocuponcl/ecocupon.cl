/**
 * Prueba de extremo a extremo contra el Supabase real.
 * Crea datos con prefijo `e2e-`; la limpieza va aparte por SQL.
 *
 *   node scripts/e2e-coupons.ts
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import { generateCouponToken, hashToken, resolveExpiry } from "../src/domains/coupon/token.ts"

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
if (!URL || !SERVICE || !ANON) throw new Error("faltan variables en .env.local")

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } })
const anonClient = createClient(URL, ANON, { auth: { persistSession: false } })

const results: { name: string; ok: boolean; detail: string }[] = []
function check(name: string, ok: boolean, detail = "") {
  results.push({ name, ok, detail })
  console.log(`  ${ok ? "PASA " : "FALLA"}  ${name}${detail ? ` — ${detail}` : ""}`)
}

const stamp = Date.now()

async function makeUser(label: string) {
  const email = `e2e-${label}-${stamp}@ecocupon.test`
  const password = `E2e${stamp}${label}`
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw new Error(`createUser ${label}: ${error.message}`)
  const client = createClient(URL, ANON, { auth: { persistSession: false } })
  const { error: signErr } = await client.auth.signInWithPassword({ email, password })
  if (signErr) throw new Error(`signIn ${label}: ${signErr.message}`)
  return { id: data.user.id, email, client }
}

async function makeMerchant(slug: string, ownerId: string) {
  const { data, error } = await admin
    .from("merchants").insert({ name: `E2E ${slug}`, slug }).select("id").single()
  if (error) throw new Error(`merchant: ${error.message}`)
  const { error: memErr } = await admin
    .from("memberships").insert({ merchant_id: data.id, user_id: ownerId, role: "owner" })
  if (memErr) throw new Error(`membership: ${memErr.message}`)
  return data.id as string
}

async function makePromotion(merchantId: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await admin.from("promotions").insert({
    merchant_id: merchantId,
    title: `E2E promocion ${stamp}`,
    discount_type: "percent",
    discount_value: 15,
    status: "published",
    max_redemptions_per_user: 1,
    ...extra,
  }).select("id").single()
  if (error) throw new Error(`promotion: ${error.message}`)
  if (!data?.id) throw new Error(`promotion: insert no devolvió id (${JSON.stringify(data)})`)
  return data.id as string
}

async function issue(promotionId: string, userId: string) {
  const token = generateCouponToken()
  const { error } = await admin.rpc("issue_coupon", {
    p_promotion_id: promotionId,
    p_token_hash: hashToken(token),
    p_user_id: userId,
    p_expires_at: resolveExpiry(null).toISOString(),
  })
  return { token, error }
}

console.log(`\nPrueba E2E contra ${URL}`)
console.log("-".repeat(64))

const ownerA = await makeUser("owner-a")
const ownerB = await makeUser("owner-b")
const consumer = await makeUser("consumer")

const merchantA = await makeMerchant(`e2e-a-${stamp}`, ownerA.id)
const merchantB = await makeMerchant(`e2e-b-${stamp}`, ownerB.id)
const promo = await makePromotion(merchantA)

const first = await issue(promo, consumer.id)
check("emisión de cupón", !first.error, first.error?.message ?? "token emitido")
if (first.error) throw new Error("sin cupón no se puede seguir")

const { data: stored } = await admin
  .from("coupon_issues").select("token_hash")
  .eq("token_hash", hashToken(first.token)).single()
check("solo se persiste el hash", !!stored && stored.token_hash !== first.token,
  "la base no guarda el token en claro")

const second = await issue(promo, consumer.id)
check("tope por usuario aplicado", !!second.error && /límite por usuario/.test(second.error.message),
  second.error?.message ?? "no se aplicó el tope")

const { data: redeemed, error: redeemErr } = await ownerA.client.rpc("redeem_coupon", {
  p_token_hash: hashToken(first.token),
})
const redeemedRow = Array.isArray(redeemed) ? redeemed[0] : redeemed
check("canje por el comercio dueño", !redeemErr && !!redeemedRow, redeemErr?.message ?? "canjeado")

const { data: again, error: againErr } = await ownerA.client.rpc("redeem_coupon", {
  p_token_hash: hashToken(first.token),
})
const againRows = Array.isArray(again) ? again.length : again ? 1 : 0
check("el segundo canje es rechazado", !againErr && againRows === 0, `filas afectadas: ${againRows}`)

const promoB = await makePromotion(merchantB)
const couponB = await issue(promoB, consumer.id)
if (!couponB.error) {
  const { error: crossErr } = await ownerA.client.rpc("redeem_coupon", {
    p_token_hash: hashToken(couponB.token),
  })
  check("A no puede canjear un cupón de B",
    !!crossErr && (crossErr.code === "42501" || /no autorizado/.test(crossErr.message)),
    crossErr?.message ?? "no se bloqueó")
}

const { error: anonInsertErr } = await anonClient.from("coupon_issues").insert({
  promotion_id: promo, merchant_id: merchantA, token_hash: "x".repeat(64),
})
check("anon no puede insertar en coupon_issues", !!anonInsertErr,
  anonInsertErr?.message ?? "el insert pasó")

const { data: seenRedemptions } = await consumer.client.from("redemptions").select("id")
check("el consumidor no lee redemptions", (seenRedemptions?.length ?? 0) === 0,
  `filas visibles: ${seenRedemptions?.length ?? 0}`)

const { data: ownRedemptions } = await ownerA.client.from("redemptions").select("id")
check("el comercio ve sus propios canjes", (ownRedemptions?.length ?? 0) >= 1,
  `filas visibles: ${ownRedemptions?.length ?? 0}`)

const draft = await makePromotion(merchantA, { status: "draft" })
const draftIssue = await issue(draft, consumer.id)
check("no se emite de una promoción en borrador", !!draftIssue.error,
  draftIssue.error?.message ?? "se emitió igual")

const passed = results.filter((r) => r.ok).length
console.log("-".repeat(64))
console.log(`${passed}/${results.length} pruebas pasaron`)
console.log(`Datos de prueba con marca e2e-${stamp}`)
console.log(`Usuarios: ${[ownerA, ownerB, consumer].map((u) => u.email).join(", ")}`)
if (passed !== results.length) process.exitCode = 1