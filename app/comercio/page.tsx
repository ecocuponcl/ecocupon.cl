import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MerchantOnboarding } from "@/components/merchant-onboarding"
import { PromotionForm } from "@/components/promotion-form"

export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  paused: "Pausada",
  expired: "Vencida",
}

interface PromotionRow {
  id: string
  title: string
  status: string
  discount_type: string
  discount_value: number
  ends_at: string | null
}

interface IssueRow {
  promotion_id: string
  status: string
}

export default async function MerchantPage() {
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
            Necesitas iniciar sesión para administrar tu comercio.
            <Link href="/auth/login?next=/comercio" className="mt-3 block underline">
              Iniciar sesión
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("merchant_id, role, merchants(name, slug)")
    .eq("user_id", user.id)
    .in("role", ["owner", "manager"])
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <h1 className="mb-1 text-xl font-bold sm:text-2xl">Registra tu comercio</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Crea tu comercio para empezar a publicar promociones.
        </p>
        <MerchantOnboarding />
      </main>
    )
  }

  const merchantId = membership.merchant_id
  const merchant = (membership as unknown as { merchants: { name: string; slug: string } }).merchants

  const { data: promotionsRaw } = await supabase
    .from("promotions")
    .select("id, title, status, discount_type, discount_value, ends_at")
    .eq("merchant_id", merchantId)
    .order("created_at", { ascending: false })
  const promotions = (promotionsRaw ?? []) as PromotionRow[]

  const { data: issuesRaw } = await supabase
    .from("coupon_issues")
    .select("promotion_id, status")
    .eq("merchant_id", merchantId)
  const issues = (issuesRaw ?? []) as IssueRow[]

  const counts = new Map<string, { issued: number; redeemed: number }>()
  for (const issue of issues) {
    const entry = counts.get(issue.promotion_id) ?? { issued: 0, redeemed: 0 }
    entry.issued += 1
    if (issue.status === "redeemed") entry.redeemed += 1
    counts.set(issue.promotion_id, entry)
  }

  const totalIssued = issues.length
  const totalRedeemed = issues.filter((i) => i.status === "redeemed").length

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">{merchant.name}</h1>
          <p className="text-sm text-muted-foreground">Panel del comercio</p>
        </div>
        <Link
          href="/comercio/validar"
          className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
        >
          Validar cupón
        </Link>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Promociones</p>
            <p className="text-2xl font-bold">{promotions?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Cupones emitidos</p>
            <p className="text-2xl font-bold">{totalIssued}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Canjeados</p>
            <p className="text-2xl font-bold">{totalRedeemed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <PromotionForm merchantId={merchantId} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tus promociones</CardTitle>
        </CardHeader>
        <CardContent>
          {promotions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Todavía no tienes promociones.
            </p>
          ) : (
            <ul className="divide-y">
              {promotions.map((promo) => {
                const stats = counts.get(promo.id) ?? { issued: 0, redeemed: 0 }
                const discount =
                  promo.discount_type === "percent"
                    ? `${Number(promo.discount_value)}%`
                    : `$${Number(promo.discount_value).toLocaleString("es-CL")}`
                return (
                  <li key={promo.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{promo.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {discount} · {stats.issued} emitidos · {stats.redeemed} canjeados
                      </p>
                    </div>
                    <Badge variant={promo.status === "published" ? "default" : "secondary"}>
                      {STATUS_LABEL[promo.status] ?? promo.status}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  )
}