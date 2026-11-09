import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "solo minúsculas, números y guiones"),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "datos inválidos", detail: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "se requiere sesión" }, { status: 401 })

  // Crea comercio y membership owner en una sola transacción: nunca queda un
  // comercio sin dueño ni un dueño sin comercio.
  const { data, error } = await supabase.rpc("create_merchant_with_owner", {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
  })

  if (error) {
    const taken = error.code === "23505"
    return NextResponse.json(
      { error: taken ? "ese identificador ya está en uso" : "no se pudo crear el comercio" },
      { status: taken ? 409 : 500 },
    )
  }

  return NextResponse.json({ merchantId: data }, { status: 201 })
}