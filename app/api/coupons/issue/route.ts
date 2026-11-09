import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateCouponToken, hashToken, resolveExpiry } from "@/src/domains/coupon/token"

const bodySchema = z.object({ promotionId: z.string().uuid() })

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "promotionId inválido" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "se requiere sesión" }, { status: 401 })
  }

  const { data: promotion } = await supabase
    .from("promotions")
    .select("id, ends_at, status")
    .eq("id", parsed.data.promotionId)
    .maybeSingle()

  if (!promotion || promotion.status !== "published") {
    return NextResponse.json({ error: "promoción no disponible" }, { status: 404 })
  }

  const token = generateCouponToken()
  const expiresAt = resolveExpiry(promotion.ends_at)

  const admin = createAdminClient()
  const { error } = await admin.rpc("issue_coupon", {
    p_promotion_id: promotion.id,
    p_token_hash: hashToken(token),
    p_user_id: user.id,
    p_expires_at: expiresAt.toISOString(),
  })

  if (error) {
    const exhausted = /agotada|límite por usuario/.test(error.message)
    return NextResponse.json(
      { error: exhausted ? error.message : "no se pudo emitir el cupón" },
      { status: exhausted ? 409 : 500 },
    )
  }

  // El token en claro se devuelve una sola vez y no se persiste en ningún lado.
  return NextResponse.json(
    { token, promotionId: promotion.id, expiresAt: expiresAt.toISOString() },
    { status: 201 },
  )
}
