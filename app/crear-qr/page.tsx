"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Copy, QrCode, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { generateQRCode, downloadQRImage, type QRData } from "@/lib/qr-api"

export default function CrearQR() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    id: `ECO-${Date.now().toString().slice(-6)}`,
    material: "mixto",
    location: "",
    contact: "",
    notes: "",
  })
  const [qrGenerated, setQrGenerated] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, material: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const qrData: QRData = {
        id: formData.id,
        material: formData.material,
        location: formData.location,
        contact: formData.contact,
        created: new Date().toISOString(),
        notes: formData.notes,
      }

      const qrUrl = await generateQRCode(qrData)
      setQrImageUrl(qrUrl)
      setQrGenerated(true)

      toast({
        title: "QR generado con éxito",
        description: "El código QR ha sido generado y está listo para usar.",
      })
    } catch (error) {
      toast({
        title: "Error al generar QR",
        description: "Hubo un problema al generar el código QR. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQR = () => {
    if (qrImageUrl) {
      downloadQRImage(qrImageUrl, `latas-x-cash-${formData.id}.png`)
      toast({
        title: "QR descargado",
        description: "El código QR ha sido descargado correctamente.",
      })
    }
  }

  const copyQRLink = () => {
    const qrLink = `https://ecocupon.cl/bolsa/${formData.id}`
    navigator.clipboard.writeText(qrLink)
    toast({
      title: "Enlace copiado",
      description: "El enlace del QR ha sido copiado al portapapeles.",
    })
  }

  return (
    <div className="min-h-screen">
      <div className="gradient-hero py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </div>

          <div className="text-center mb-8">
            <span className="inline-block bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
              Genera tu código
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">LATAS X CA$H</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Crea un código QR único para tu bolsa de reciclaje que contenga toda la información necesaria
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="id">ID de la Bolsa</Label>
                  <Input id="id" name="id" value={formData.id} onChange={handleChange} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">ID generado automáticamente</p>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Material</Label>
                  <RadioGroup
                    value={formData.material}
                    onValueChange={handleRadioChange}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="aluminio" id="aluminio" />
                      <Label htmlFor="aluminio" className="flex-1 cursor-pointer">
                        Aluminio (Latas)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="vidrio" id="vidrio" />
                      <Label htmlFor="vidrio" className="flex-1 cursor-pointer">
                        Vidrio (Botellas)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="mixto" id="mixto" />
                      <Label htmlFor="mixto" className="flex-1 cursor-pointer">
                        Mixto (Aluminio y Vidrio)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Comuna, Sector"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contacto</Label>
                  <Input
                    id="contact"
                    name="contact"
                    placeholder="WhatsApp o teléfono"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Detalles adicionales sobre el contenido, horarios de disponibilidad, etc."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generar Código QR
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* QR Preview */}
          <div className="flex items-start justify-center">
            <Card className="w-full max-w-md shadow-lg border-0">
              <CardContent className="p-8">
                {qrGenerated && qrImageUrl ? (
                  <div className="flex flex-col items-center">
                    <h2 className="text-3xl font-bold mb-2 text-green-600">LATAS X CA$H</h2>
                    <p className="text-sm text-muted-foreground mb-6">Escanea para ver detalles</p>

                    <div className="bg-white p-4 rounded-2xl mb-6 border-4 border-green-500 shadow-lg">
                      <img
                        src={qrImageUrl || "/placeholder.svg"}
                        alt={`QR Code for ${formData.id}`}
                        width={280}
                        height={280}
                        className="w-[280px] h-[280px]"
                      />
                    </div>

                    <div className="text-center mb-6 space-y-1">
                      <h3 className="font-semibold text-lg">{formData.id}</h3>
                      <p className="text-sm text-muted-foreground capitalize">Material: {formData.material}</p>
                      <p className="text-sm text-muted-foreground">{formData.location}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={downloadQR}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar QR
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent" onClick={copyQRLink}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar enlace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <h2 className="text-3xl font-bold mb-2 text-green-600">LATAS X CA$H</h2>
                    <p className="text-sm text-muted-foreground mb-8">Vista previa del QR</p>

                    <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-6">
                      <QrCode className="h-12 w-12 text-muted-foreground" />
                    </div>

                    <p className="text-sm text-muted-foreground max-w-xs">
                      Completa el formulario y genera tu código QR para visualizarlo aquí
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
