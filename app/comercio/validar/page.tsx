import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { CouponValidator } from "@/components/coupon-validator"

export const dynamic = "force-dynamic"

export default async function ValidatePage() {
  const supabase = await createClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="container mx-auto max-w-md px-4 py-12">
        <Card>
          <CardContent className="py-10 text-center text-sm">
            Necesitas iniciar sesión para validar cupones.
            <Link href="/auth/login?next=/comercio/validar" className="mt-3 block underline">
              Iniciar sesión
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto max-w-md px-4 py-8 sm:py-12">
      <Link href="/comercio" className="mb-6 inline-block text-sm text-muted-foreground hover:underline">
        ← Panel del comercio
      </Link>
      <h1 className="mb-1 text-xl font-bold sm:text-2xl">Validar cupón</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ingresa o escanea el código que muestra el cliente.
      </p>
      <CouponValidator />
    </main>
  )
}