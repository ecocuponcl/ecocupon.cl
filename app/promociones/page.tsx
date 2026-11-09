import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

interface MarketplacePromotion {
  id: string
  title: string
  description: string | null
  discount_type: "percent" | "amount"
  discount_value: number
  ends_at: string | null
  merchant_name: string
}

function formatDiscount(type: string, value: number) {
  return type === "percent"
    ? `${Number(value)}% de descuento`
    : `$${Number(value).toLocaleString("es-CL")} de descuento`
}

function formatEnds(endsAt: string | null) {
  if (!endsAt) return "Sin fecha de término"
  return `Hasta el ${new Date(endsAt).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
  })}`
}

export default async function MarketplacePage() {
  const supabase = await createClient()

  if (!supabase) {
    return (
      <main className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground">
          La plataforma no está configurada. Falta la conexión con Supabase.
        </p>
      </main>
    )
  }

  const { data, error } = await supabase
    .from("marketplace_promotions")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(60)

  const promotions = (data ?? []) as MarketplacePromotion[]

  return (
    <main className="container mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Descubre. Ahorra. Vuelve.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Promociones vigentes de comercios de tu ciudad.
        </p>
      </div>

      {error && (
        <p className="mb-6 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          No se pudieron cargar las promociones.
        </p>
      )}

      {promotions.length === 0 && !error && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Todavía no hay promociones publicadas.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <Card key={promo.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge variant="secondary">
                  {formatDiscount(promo.discount_type, promo.discount_value)}
                </Badge>
                <span className="text-xs text-muted-foreground">{promo.merchant_name}</span>
              </div>
              <CardTitle className="text-base leading-snug">{promo.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {promo.description && (
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {promo.description}
                </p>
              )}
              <p className="mb-4 text-xs text-muted-foreground">{formatEnds(promo.ends_at)}</p>
              <Link
                href={`/promocion/${promo.id}`}
                className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Ver cupón
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}