"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function MerchantOnboarding() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "No se pudo crear", description: data.error, variant: "destructive" })
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
    <form onSubmit={submit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="merchant-name" className="mb-1 block text-sm font-medium">
          Nombre del comercio
        </label>
        <Input
          id="merchant-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setSlug(
              e.target.value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[̀-ͯ]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, ""),
            )
          }}
          required
          minLength={2}
          maxLength={120}
        />
      </div>
      <div>
        <label htmlFor="merchant-slug" className="mb-1 block text-sm font-medium">
          Identificador público
        </label>
        <Input
          id="merchant-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          pattern="[a-z0-9][a-z0-9-]*"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">Aparecerá en la dirección de tu comercio.</p>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creando…" : "Crear comercio"}
      </Button>
    </form>
  )
}