"use client"

import { useState } from "react"
import { Check, AlertCircle, Car, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface PlateResponse {
  success: boolean
  valid: boolean
  format?: string
  normalized?: string
  error?: string
  remaining?: number
  message: string
}

export default function HomePage() {
  const [plate, setPlate] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<PlateResponse | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!plate.trim()) {
      toast({
        title: "Placa requerida",
        description: "Ingresa la placa patente del vehículo",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      // Call the API
      const res = await fetch("/api/plate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plate })
      })

      const data = await res.json()
      setResponse(data)
      setLoading(false)

      if (data.success) {
        toast({
          title: "¡Placa validada!",
          description: data.message,
        })
      } else {
        toast({
          title: data.error === "DAILY_LIMIT_REACHED" ? "Límite alcanzado" : "Formato inválido",
          description: data.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("API error:", error)
      toast({
        title: "Error",
        description: "No se pudo conectar con el servidor",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPlate("")
    setResponse(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Validación de Placa Patente
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Ingresa la placa patente de tu vehículo para validar el formato
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label 
                  htmlFor="plate" 
                  className="text-sm font-medium text-foreground"
                >
                  Placa Patente
                </label>
                <div className="flex gap-2">
                  <input
                    id="plate"
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="ABCD-12 o AA-12-34"
                    className="flex-1 px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase tracking-wider font-mono"
                    maxLength={9}
                    disabled={loading}
                  />
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="px-6"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Validar"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ejemplos: ABCD-12, ABC-12, AA-12-34
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Response Display */}
        {response && (
          <Card className={`mb-6 shadow-lg border-2 ${
            response.valid 
              ? "border-green-500/50 bg-green-500/5" 
              : "border-red-500/50 bg-red-500/5"
          }`}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    response.valid 
                      ? "bg-green-500/20" 
                      : "bg-red-500/20"
                  }`}>
                    {response.valid ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${
                      response.valid 
                        ? "text-green-700" 
                        : "text-red-700"
                    }`}>
                      {response.valid ? "¡Válido!" : "Inválido"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {response.message}
                    </p>
                  </div>
                </div>

                {response.valid && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Formato
                      </p>
                      <p className="text-sm font-medium">
                        {response.format === "old" ? "Antiguo" : "Nuevo"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Placa Normalizada
                      </p>
                      <p className="text-sm font-mono font-bold">
                        {response.normalized}
                      </p>
                    </div>
                  </div>
                )}

                {response.remaining !== undefined && (
                  <div className="text-center text-sm text-muted-foreground pt-2 border-t">
                    Validaciones restantes hoy: <span className="font-semibold text-foreground">{response.remaining}</span>
                  </div>
                )}

                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  className="w-full mt-4"
                >
                  Validar Otra Placa
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">
                  Formatos soportados:
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      ABCD-12
                    </span>
                    <span>Patente antigua (4 letras + 2 números)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      ABC-12
                    </span>
                    <span>Patente antigua (3 letras + 2 números)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      AA-12-34
                    </span>
                    <span>Patente nueva (2-2-2)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
