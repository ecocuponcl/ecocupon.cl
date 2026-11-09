import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CouponClaim } from "@/components/coupon-claim"

export const dynamic = "force-dynamic"

export default async function PromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) notFound()

  const { data: promo } = await supabase
    .from("marketplace_promotions")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!promo) notFound()

  const discount =
    promo.discount_type === "percent"
      ? `${Number(promo.discount_value)}% de descuento`
      : `$${Number(promo.discount_value).toLocaleString("es-CL")} de descuento`

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Link href="/promociones" className="mb-6 inline-block text-sm text-muted-foreground hover:underline">
        ← Volver al marketplace
      </Link>

      <Card>
        <CardContent className="p-6">
          <Badge variant="secondary" className="mb-3">{discount}</Badge>
          <h1 className="text-xl font-bold sm:text-2xl">{promo.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">por {promo.merchant_name}</p>

          {promo.description && (
            <p className="mt-4 text-sm leading-relaxed">{promo.description}</p>
          )}

          {promo.terms && (
            <div className="mt-4 rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Condiciones
              </p>
              <p className="mt-1 text-sm">{promo.terms}</p>
            </div>
          )}

          {promo.ends_at && (
            <p className="mt-4 text-xs text-muted-foreground">
              Promoción válida hasta el{" "}
              {new Date(promo.ends_at).toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}

          <div className="mt-6">
            <CouponClaim promotionId={promo.id} />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}