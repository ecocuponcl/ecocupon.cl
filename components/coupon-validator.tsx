"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

type Result =
  | { kind: "ok"; redeemedAt: string }
  | { kind: "error"; message: string }
  | null

export function CouponValidator() {
  const { toast } = useToast()
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result>(null)

  async function validate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()

      if (res.status === 401) {
        window.location.href = "/auth/login?next=/comercio/validar"
        return
      }
      if (res.ok) {
        setResult({ kind: "ok", redeemedAt: data.redeemedAt })
        setToken("")
      } else {
        setResult({ kind: "error", message: data.error ?? "Cupón no válido" })
      }
    } catch {
      toast({ title: "Sin conexión", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <form onSubmit={validate} className="space-y-3">
        <div>
          <label htmlFor="coupon-token" className="mb-1 block text-sm font-medium">
            Código del cupón
          </label>
          <Input
            id="coupon-token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ECO-XXXX-XXXX-XXXX-XXXX-XXXX"
            required
            autoComplete="off"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={loading || !token.trim()} className="w-full gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Validando…" : "Validar y canjear"}
        </Button>
      </form>

      {result?.kind === "ok" && (
        <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="font-medium">Cupón canjeado</p>
            <p className="text-xs text-muted-foreground">
              Registrado el {new Date(result.redeemedAt).toLocaleString("es-CL")}
            </p>
          </div>
        </div>
      )}

      {result?.kind === "error" && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{result.message}</p>
        </div>
      )}
    </div>
  )
}