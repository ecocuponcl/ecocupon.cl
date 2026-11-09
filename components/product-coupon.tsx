"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Copy, Loader2, MessageCircle, Ticket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"
import { validatePhoneNumber, truncateString } from "@/lib/validators"

interface ProductCouponProps {
  product: {
    id: string
    name: string
    price: number
    knastaPrice?: { price: number } | null
  }
  discount: number
  /**
   * Promoción de la que se emite el cupón. Sin esto no se genera ningún código:
   * antes el componente lo calculaba en el navegador y cualquiera podía derivar
   * los códigos del resto de los productos.
   */
  promotionId?: string
}

export function ProductCoupon({ product, discount, promotionId }: ProductCouponProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [phone, setPhone] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [issuing, setIssuing] = useState(false)

  const safeProductName = truncateString(product.name, 100)
  const savings = product.knastaPrice ? product.price - product.knastaPrice.price : 0

  async function issueCoupon() {
    if (!promotionId) return
    setIssuing(true)
    try {
      const res = await fetch("/api/coupons/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({
          title: "No se pudo obtener el cupón",
          description: data.error ?? "Intenta nuevamente.",
          variant: "destructive",
        })
        return
      }
      setToken(data.token)
    } catch {
      toast({
        title: "Sin conexión",
        description: "No se pudo contactar al servidor.",
        variant: "destructive",
      })
    } finally {
      setIssuing(false)
    }
  }

  function copyToClipboard() {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    toast({ title: "Código copiado", description: "El código ha sido copiado al portapapeles." })
    setTimeout(() => setCopied(false), 2000)
  }

  function sendWhatsApp() {
    if (!token) return
    const cleanPhone = validatePhoneNumber(phone)
    if (!cleanPhone) {
      toast({
        title: "Número inválido",
        description: "Ingresa un número de WhatsApp válido (8-15 dígitos).",
        variant: "destructive",
      })
      return
    }

    const message = truncateString(
      `Hola! Te comparto este cupon de EcoCupon: ${token}\n\nProducto: ${safeProductName}\nAhorro: $${formatPrice(savings)} (${discount}% OFF)\n\nVer oferta en EcoCupon`,
      1000,
    )
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    )
  }

  if (!promotionId) {
    return (
      <Card className="mb-4 border-muted bg-muted/30">
        <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <Ticket className="h-4 w-4 shrink-0" />
          <span>Esta oferta todavía no tiene una promoción publicada.</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-primary sm:text-base">
          Ahorra {discount}% con este cupón
        </h3>

        {token ? (
          <div className="mb-3 flex items-center justify-between rounded-md bg-background p-3">
            <code className="text-sm font-bold sm:text-base">{token}</code>
            <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copiar</span>
            </Button>
          </div>
        ) : (
          <Button onClick={issueCoupon} disabled={issuing} className="mb-3 w-full gap-2">
            {issuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            {issuing ? "Generando…" : "Obtener cupón"}
          </Button>
        )}

        {token && (
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="+56 9 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9 text-sm"
              maxLength={20}
            />
            <Button onClick={sendWhatsApp} size="sm" className="shrink-0 gap-1.5">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Enviar</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
