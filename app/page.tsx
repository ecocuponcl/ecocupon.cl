import { ArrowRight, Zap, Monitor, Shirt, Home } from "lucide-react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { CatalogService } from "@/application"
import { PriceComparisonService } from "@/domains/pricing"

const CATEGORY_ICONS = [
  { slug: "all", label: "Ofertas de hoy", icon: Zap, color: "#10b981", desc: "Bajadas de precio de las últimas horas" },
  { slug: "technology", label: "Tecnología", icon: Monitor, color: "#2563eb", desc: "Mejores ofertas en tecnología" },
  { slug: "fashion", label: "Moda", icon: Shirt, color: "#e11d48", desc: "Ofertas en ropa y calzado" },
  { slug: "home", label: "Hogar", icon: Home, color: "#d97706", desc: "Descuentos en hogar" },
] as const

async function getHomePageData() {
  try {
    const catalogService = new CatalogService()
    
    const [categories, productsResult] = await Promise.all([
      catalogService.getCategoriesWithProductCount(),
      catalogService.getHomeProducts(20),
    ]).catch(err => {
      console.error('Data fetch error:', err)
      return [[], { data: [] }]
    })

    const allProducts = (productsResult as any)?.data || []
    const discountedProducts = allProducts.filter((product: any) => {
      try {
        if (!product?.knastaPrices?.[0]?.price) return false
        const currentPrice = product.price?.value ?? product.price
        const knastaPrice = product.knastaPrices[0].price
        return knastaPrice < currentPrice
      } catch (e) {
        return false
      }
    })

    return {
      categories: (categories as any[]) || [],
      products: discountedProducts,
    }
  } catch (error) {
    console.error('Critical home page error:', error)
    return {
      categories: [],
      products: [],
    }
  }
}

export default async function HomePage() {
  const { categories, products } = await getHomePageData()

  return (
    <main className="container">
      {/* Hero Categories Section */}
      <section>
        <div className="hero-grid">
          {CATEGORY_ICONS.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="hero-card">
              <div className="icon-wrapper" style={{ backgroundColor: c.color }}>
                <c.icon size={20} />
              </div>
              <h3>{c.label}</h3>
              <p>{c.desc}</p>
              <div className="action-link">
                Ver ofertas <ArrowRight size={14} style={{ marginLeft: '4px' }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Deals Section */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Mejores Ofertas</h2>
          <Link href="/category/all" className="btn btn-outline">Ver todo</Link>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted-foreground)' }}>
            No hay productos con descuento disponibles.
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product: any) => {
              const knastaPrice = product.knastaPrices?.[0]?.price
              const discount = knastaPrice
                ? PriceComparisonService.calculateSavings(
                    { value: knastaPrice, currency: 'CLP' } as any,
                    { value: product.price.value ?? product.price, currency: 'CLP' } as any
                  ).discountPercent
                : 0

              return (
                <Link key={product.id} href={`/product/${product.id}`} className="card">
                  <div className="card-image">
                    <img
                      src={product.imageUrl?.value || "/placeholder.svg?height=300&width=300"}
                      alt={product.name}
                    />
                    {discount > 0 && (
                      <span className="badge">-{discount}%</span>
                    )}
                  </div>
                  <div className="card-content">
                    <span className="text-overline">{product.categoryName || "General"}</span>
                    <h3 className="text-title">{product.name}</h3>
                    <div style={{ marginTop: 'auto' }}>
                      <span className="price-old">
                        ${formatPrice(product.price.value ?? product.price)}
                      </span>
                      <span className="price-new">
                        ${formatPrice(knastaPrice ?? (product.price.value ?? product.price))}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Footer Categories Section */}
      <section>
        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Explorar Categorías</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="card" style={{ flexDirection: 'row', minHeight: '120px' }}>
              <div style={{ width: '40%', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={cat.imageUrl || "/placeholder.svg?height=300&width=500"}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="card-content" style={{ padding: '0.75rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{cat.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{cat.description}</p>
                <div style={{ textAlign: 'right', marginTop: 'auto' }}>
                  <ArrowRight size={16} color="var(--primary)" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
