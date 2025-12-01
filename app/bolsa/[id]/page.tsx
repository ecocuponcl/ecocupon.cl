"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { ArrowLeft, Download, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Mock data for demonstration
const mockBagData = {
  id: "ECO-123456",
  material: "aluminio",
  location: "Santiago, Providencia",
  contact: "+56 9 1234 5678",
  created: "2023-04-01T10:30:00Z",
  status: "active",
}

export default function BolsaDetalle({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [bag, setBag] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For demo purposes, we're using mock data
    setTimeout(() => {
      setBag({
        ...mockBagData,
        id: params.id,
      })
      setLoading(false)
    }, 500)
  }, [params.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getMaterialColor = (material: string) => {
    switch (material) {
      case "aluminio":
        return "bg-blue-100 text-blue-800"
      case "vidrio":
        return "bg-green-100 text-green-800"
      case "mixto":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const qrValue = bag
    ? JSON.stringify({
        id: bag.id,
        material: bag.material,
        location: bag.location,
        contact: bag.contact,
        created: bag.created,
      })
    : ""

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")

      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `ecocupon-${bag.id}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EcoCupón - Bolsa ${bag.id}`,
          text: `Bolsa de reciclaje de ${bag.material} en ${bag.location}. Contacto: ${bag.contact}`,
          url: window.location.href,
        })
      } catch (error) {
        toast({
          title: "Error al compartir",
          description: "No se pudo compartir el contenido.",
        })
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles.",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  if (!bag) {
    return (
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <h2 className="text-2xl font-bold mb-2">Bolsa no encontrada</h2>
          <p className="text-muted-foreground mb-6">La bolsa con ID {params.id} no existe o ha sido eliminada.</p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/mis-bolsas" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mis bolsas
        </Link>
      </div>

      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Detalles de la Bolsa</h1>
        <p className="text-muted-foreground max-w-2xl">Información detallada y código QR de tu bolsa de reciclaje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{bag.id}</h2>
                <Badge className={getMaterialColor(bag.material)} variant="outline">
                  {bag.material.charAt(0).toUpperCase() + bag.material.slice(1)}
                </Badge>
              </div>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4 py-2 border-b">
                  <div className="col-span-1 text-muted-foreground">Ubicación</div>
                  <div className="col-span-2 text-right">{bag.location}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2 border-b">
                  <div className="col-span-1 text-muted-foreground">Contacto</div>
                  <div className="col-span-2 text-right">{bag.contact}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2 border-b">
                  <div className="col-span-1 text-muted-foreground">Fecha de creación</div>
                  <div className="col-span-2 text-right">{formatDate(bag.created)}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-2 border-b">
                  <div className="col-span-1 text-muted-foreground">Estado</div>
                  <div className="col-span-2 text-right">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">LATAS X CA$H</h2>
            <div className="bg-white p-6 rounded-lg mb-6 border-2 border-green-500">
              <QRCodeSVG id="qr-canvas" value={qrValue} size={250} level="H" includeMargin={true} />
            </div>

            <div className="flex space-x-4 w-full justify-center">
              <Button variant="outline" onClick={downloadQR}>
                <Download className="mr-2 h-4 w-4" />
                Descargar QR
              </Button>
              <Button variant="outline" onClick={shareQR}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Escanea este código QR para acceder a la información de la bolsa.</p>
              <p className="mt-2">Comparte este código con posibles compradores de reciclaje.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instrucciones para compradores</h2>
        <div className="space-y-4 text-sm">
          <p>1. Escanea el código QR para verificar el contenido y la ubicación de la bolsa de reciclaje.</p>
          <p>2. Contacta al vendedor utilizando la información de contacto proporcionada.</p>
          <p>3. Coordina la recolección o entrega del material reciclable.</p>
          <p>4. Realiza el pago según lo acordado con el vendedor.</p>
        </div>
      </div>
    </div>
  )
}

