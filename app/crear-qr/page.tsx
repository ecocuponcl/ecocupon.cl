"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft, Download, Copy, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, material: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setQrGenerated(true)

    // In a real app, you would save this data to a database
    toast({
      title: "QR generado con éxito",
      description: "El código QR ha sido generado y está listo para usar.",
    })
  }

  const qrValue = JSON.stringify({
    id: formData.id,
    material: formData.material,
    location: formData.location,
    contact: formData.contact,
    created: new Date().toISOString(),
  })

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")

      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `ecocupon-${formData.id}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const copyQRLink = () => {
    // In a real app, this would be a link to your domain with the QR ID
    const qrLink = `https://ecocupon.cl/bolsa/${formData.id}`
    navigator.clipboard.writeText(qrLink)
    toast({
      title: "Enlace copiado",
      description: "El enlace del QR ha sido copiado al portapapeles.",
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generar Código QR</h1>
        <p className="text-muted-foreground max-w-2xl">
          Crea un código QR único para tu bolsa de reciclaje que contenga toda la información necesaria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
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
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aluminio" id="aluminio" />
                  <Label htmlFor="aluminio">Aluminio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vidrio" id="vidrio" />
                  <Label htmlFor="vidrio">Vidrio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixto" id="mixto" />
                  <Label htmlFor="mixto">Mixto (Aluminio y Vidrio)</Label>
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

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Generar Código QR
            </Button>
          </form>
        </div>

        <div>
          <Card className="border-dashed">
            <CardContent className="pt-6">
              {qrGenerated ? (
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold mb-4 text-green-600">LATAS X CA$H</h2>
                  <div className="bg-white p-6 rounded-lg mb-6 border-2 border-green-500">
                    <QRCodeSVG id="qr-canvas" value={qrValue} size={250} level="H" includeMargin={true} />
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="font-medium">Bolsa: {formData.id}</h3>
                    <p className="text-sm text-muted-foreground capitalize">Material: {formData.material}</p>
                    <p className="text-sm text-muted-foreground">Ubicación: {formData.location}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={downloadQR}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyQRLink}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar enlace
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-center p-4">
                  <h2 className="text-2xl font-bold mb-4 text-green-600">LATAS X CA$H</h2>
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <QrCode className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">Vista previa del QR</h3>
                  <p className="text-sm text-muted-foreground">
                    Completa el formulario y genera tu código QR para visualizarlo aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

