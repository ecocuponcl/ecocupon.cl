import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { hashToken, isValidTokenFormat } from "@/src/domains/coupon/token"

const bodySchema = z.object({
  token: z.string().min(1).max(80),
  storeId: z.string().uuid().nullish(),
})

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "token inválido" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "se requiere sesión" }, { status: 401 })
  }

  if (!isValidTokenFormat(parsed.data.token)) {
    return NextResponse.json({ error: "cupón no válido" }, { status: 404 })
  }

  const tokenHash = hashToken(parsed.data.token)

  // El canje se resuelve con un único UPDATE condicional dentro de la base:
  // si dos cajas validan el mismo cupón a la vez, solo una obtiene fila.
  const { data, error } = await supabase.rpc("redeem_coupon", {
    p_token_hash: tokenHash,
    p_store_id: parsed.data.storeId ?? null,
  })

  if (error) {
    const unauthorized = error.code === "42501"
    return NextResponse.json(
      { error: unauthorized ? "no autorizado para validar cupones de este comercio" : "no se pudo validar" },
      { status: unauthorized ? 403 : 500 },
    )
  }

  const redeemed = Array.isArray(data) ? data[0] : data
  if (redeemed) {
    return NextResponse.json({
      ok: true,
      issueId: redeemed.issue_id,
      promotionId: redeemed.promotion_id,
      redeemedAt: redeemed.redeemed_at,
    })
  }

  // Cero filas: ya canjeado, expirado, revocado o inexistente. RLS impide ver
  // cupones de otros comercios, así que esto no filtra nada ajeno.
  const { data: existing } = await supabase
    .from("coupon_issues")
    .select("status, redeemed_at")
    .eq("token_hash", tokenHash)
    .maybeSingle()

  if (existing?.status === "redeemed") {
    return NextResponse.json(
      { error: "este cupón ya fue canjeado", redeemedAt: existing.redeemed_at },
      { status: 409 },
    )
  }
  if (existing) {
    return NextResponse.json({ error: `cupón ${existing.status}` }, { status: 409 })
  }
  return NextResponse.json({ error: "cupón no válido" }, { status: 404 })
}
