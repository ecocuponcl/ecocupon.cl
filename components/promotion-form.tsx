"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function PromotionForm({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountType: "percent" as "percent" | "amount",
    discountValue: "15",
    terms: "",
    endsAt: "",
    maxRedemptionsPerUser: "1",
    publish: true,
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          title: form.title,
          description: form.description || null,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          terms: form.terms || null,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
          maxRedemptionsPerUser: Number(form.maxRedemptionsPerUser) || 1,
          status: form.publish ? "published" : "draft",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: "No se pudo crear",
          description: typeof data.error === "string" ? data.error : "Revisa los datos.",
          variant: "destructive",
        })
        return
      }
      toast({ title: form.publish ? "Promoción publicada" : "Borrador guardado" })
      window.location.reload()
    } catch {
      toast({ title: "Sin conexión", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Nueva promoción</Button>
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-3 rounded-lg border p-4">
      <div>
        <label htmlFor="promo-title" className="mb-1 block text-sm font-medium">Título</label>
        <Input
          id="promo-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
          minLength={3}
          maxLength={140}
          placeholder="2x1 en café de especialidad"
        />
      </div>
      <div>
        <label htmlFor="promo-desc" className="mb-1 block text-sm font-medium">Descripción</label>
        <Input
          id="promo-desc"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={2000}
        />
      </div>
      <div className="flex gap-3">
        <div className="w-32">
          <label htmlFor="promo-type" className="mb-1 block text-sm font-medium">Tipo</label>
          <select
            id="promo-type"
            value={form.discountType}
            onChange={(e) => set("discountType", e.target.value as "percent" | "amount")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="percent">Porcentaje</option>
            <option value="amount">Monto fijo</option>
          </select>
        </div>
        <div className="w-32">
          <label htmlFor="promo-value" className="mb-1 block text-sm font-medium">Valor</label>
          <Input
            id="promo-value"
            type="number"
            min="1"
            max={form.discountType === "percent" ? 100 : undefined}
            value={form.discountValue}
            onChange={(e) => set("discountValue", e.target.value)}
            required
          />
        </div>
        <div className="w-32">
          <label htmlFor="promo-limit" className="mb-1 block text-sm font-medium">Por cliente</label>
          <Input
            id="promo-limit"
            type="number"
            min="1"
            max="50"
            value={form.maxRedemptionsPerUser}
            onChange={(e) => set("maxRedemptionsPerUser", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="promo-ends" className="mb-1 block text-sm font-medium">Vence</label>
        <Input
          id="promo-ends"
          type="date"
          value={form.endsAt}
          onChange={(e) => set("endsAt", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="promo-terms" className="mb-1 block text-sm font-medium">Condiciones</label>
        <Input
          id="promo-terms"
          value={form.terms}
          onChange={(e) => set("terms", e.target.value)}
          maxLength={1000}
          placeholder="No acumulable con otras promociones"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.publish}
          onChange={(e) => set("publish", e.target.checked)}
        />
        Publicar en el marketplace
      </label>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Guardando…" : "Guardar"}</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
      </div>
    </form>
  )
}