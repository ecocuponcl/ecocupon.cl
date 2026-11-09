"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Check, Copy, Loader2, Ticket } from "lucide-react"

export function CouponClaim({ promotionId }: { promotionId: string }) {
  const { toast } = useToast()
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function claim() {
    setLoading(true)
    try {
      const res = await fetch("/api/coupons/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotionId }),
      })
      const data = await res.json()

      if (res.status === 401) {
        window.location.href = `/auth/login?next=/promocion/${promotionId}`
        return
      }
      if (!res.ok) {
        toast({
          title: "No se pudo obtener el cupón",
          description: data.error ?? "Intenta nuevamente.",
          variant: "destructive",
        })
        return
      }
      setToken(data.token)
      setExpiresAt(data.expiresAt)
    } catch {
      toast({
        title: "Sin conexión",
        description: "No se pudo contactar al servidor.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    toast({ title: "Código copiado" })
    setTimeout(() => setCopied(false), 2000)
  }

  if (token) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="mb-2 text-sm font-medium">Tu cupón</p>
        <div className="flex items-center justify-between gap-2 rounded-md bg-background p-3">
          <code className="break-all text-sm font-bold">{token}</code>
          <Button variant="ghost" size="icon" onClick={copy} className="h-8 w-8 shrink-0">
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copiar</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Muéstralo en el comercio para canjearlo.
          {expiresAt && ` Vence el ${new Date(expiresAt).toLocaleDateString("es-CL")}.`}
        </p>
      </div>
    )
  }

  return (
    <Button onClick={claim} disabled={loading} className="w-full gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
      {loading ? "Generando…" : "Obtener mi cupón"}
    </Button>
  )
}