"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function PromotionStatusToggle({
  promotionId,
  status,
}: {
  promotionId: string
  status: string
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const next = status === "published" ? "paused" : "published"
  const label = status === "published" ? "Pausar" : "Publicar"

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch("/api/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: promotionId, status: next }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast({ title: "No se pudo cambiar", description: data.error, variant: "destructive" })
        return
      }
      window.location.reload()
    } catch {
      toast({ title: "Sin conexión", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={loading}>
      {loading ? "…" : label}
    </Button>
  )
}