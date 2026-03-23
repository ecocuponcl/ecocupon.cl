import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Monitor, Shirt, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import { logError } from "@/lib/logger"
import type { Database } from "@/lib/database.types"

type Category = Database["public"]["Tables"]["categories"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]
type KnastaPrice = Database["public"]["Tables"]["knasta_prices"]["Row"]

type EnrichedProduct = Product & {
  knastaPrice: KnastaPrice | null
  category: { name: string; slug: string }
}

async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("*")
  if (error) {
    logError("HomePage:getCategories", "Error fetching categories", error)
    return []
  }
  return (data as Category[]) ?? []
}

async function getDiscountedProducts() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select("*, category:categories(name, slug), knasta_prices(*)")
    .order("created_at", { ascending: false })

  if (error || !products) {
    logError("HomePage:getDiscountedProducts", "Error fetching products", error)
    return []
  }

  return (products as any[]).filter((p) => {
    const knastaPrice = p.knasta_prices?.[0]
    return knastaPrice && knastaPrice.price < p.price
  }).map((p) => ({
    ...p,
    knastaPrice: p.knasta_prices?.[0] || null,
    category: p.category || { name: "General", slug: "all" },
  })) as EnrichedProduct[]
}

const CATEGORY_ICONS = [
  { slug: "all", label: "Ofertas de hoy", icon: Zap, color: "bg-primary", desc: "Las bajadas de precio de las últimas horas" },
  { slug: "technology", label: "Tecnología", icon: Monitor, color: "bg-blue-600", desc: "Las mejores ofertas en tecnología" },
  { slug: "fashion", label: "Moda", icon: Shirt, color: "bg-rose-600", desc: "Ofertas en ropa y calzado" },
  { slug: "home", label: "Hogar", icon: Home, color: "bg-amber-600", desc: "Descuentos en productos para el hogar" },
] as const

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getDiscountedProducts()])

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:py-8">
      <section className="mb-6 sm:mb-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CATEGORY_ICONS.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`}>
              <Card className="group h-full overflow-hidden border-0 bg-foreground text-background transition-shadow hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-3 sm:p-5">
                  <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10 ${c.color} text-background`}>
                    <c.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <h2 className="mb-1 text-sm font-bold sm:text-lg">{c.label}</h2>
                  <p className="mb-3 text-xs text-muted-foreground/70 sm:text-sm">{c.desc}</p>
                  <div className="mt-auto">
                    <span className="inline-flex items-center text-xs font-medium text-primary sm:text-sm">
                      Ver ofertas <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 sm:mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold sm:text-2xl">Mejores Ofertas</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/category/all">Ver todo</Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">No hay productos con descuento disponibles.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => {
              const discount = product.knastaPrice
                ? Math.round(((product.price - product.knastaPrice.price) / product.price) * 100)
                : 0

              return (
                <Link key={product.id} href={`/product/${product.id}`} className="group">
                  <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={product.image || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        fill
                        className="object-contain p-3"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                      {discount > 0 && (
                        <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
                          -{discount}%
                        </Badge>
                      )}
                    </div>
                    <CardContent className="flex flex-1 flex-col p-2.5 sm:p-4">
                      <span className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                        {product.category.name}
                      </span>
                      <h3 className="mb-2 line-clamp-2 text-xs font-medium leading-snug group-hover:underline sm:text-sm">
                        {product.name}
                      </h3>
                      <div className="mt-auto">
                        <span className="block text-xs text-muted-foreground line-through">
                          ${formatPrice(product.price)}
                        </span>
                        <span className="text-base font-bold sm:text-lg">
                          ${formatPrice(product.knastaPrice?.price ?? product.price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold sm:text-2xl">Categorías</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}>
              <Card className="group overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative h-32 w-full bg-muted sm:h-44">
                  <Image
                    src={cat.image || "/placeholder.svg?height=300&width=500"}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <CardContent className="flex items-center justify-between p-3 sm:p-4">
                  <div>
                    <h3 className="font-semibold sm:text-lg">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">{cat.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
