import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const createSchema = z.object({
  merchantId: z.string().uuid(),
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(2000).optional().nullable(),
  discountType: z.enum(["percent", "amount"]),
  discountValue: z.number().positive(),
  terms: z.string().trim().max(1000).optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  maxRedemptions: z.number().int().positive().optional().nullable(),
  maxRedemptionsPerUser: z.number().int().positive().max(50).default(1),
  status: z.enum(["draft", "published"]).default("draft"),
})

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: "datos inválidos", detail: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }
  const body = parsed.data

  if (body.discountType === "percent" && body.discountValue > 100) {
    return NextResponse.json({ error: "el porcentaje no puede superar 100" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "se requiere sesión" }, { status: 401 })

  // RLS exige owner o manager del comercio: si no lo es, el insert no devuelve fila.
  const { data, error } = await supabase
    .from("promotions")
    .insert({
      merchant_id: body.merchantId,
      title: body.title,
      description: body.description ?? null,
      discount_type: body.discountType,
      discount_value: body.discountValue,
      terms: body.terms ?? null,
      ends_at: body.endsAt ?? null,
      max_redemptions: body.maxRedemptions ?? null,
      max_redemptions_per_user: body.maxRedemptionsPerUser,
      status: body.status,
    })
    .select("id")
    .single()

  if (error) {
    const forbidden = error.code === "42501" || /row-level security/.test(error.message)
    return NextResponse.json(
      { error: forbidden ? "no autorizado en este comercio" : "no se pudo crear la promoción" },
      { status: forbidden ? 403 : 500 },
    )
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}

export async function PATCH(request: Request) {
  const schema = z.object({
    id: z.string().uuid(),
    status: z.enum(["draft", "published", "paused", "expired"]),
  })
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "datos inválidos" }, { status: 400 })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "se requiere sesión" }, { status: 401 })

  const { data, error } = await supabase
    .from("promotions")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle()

  if (error) return NextResponse.json({ error: "no se pudo actualizar" }, { status: 500 })
  if (!data) return NextResponse.json({ error: "no autorizado" }, { status: 403 })

  return NextResponse.json({ ok: true })
}