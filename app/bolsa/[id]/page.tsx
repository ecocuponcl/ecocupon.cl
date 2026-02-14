"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Share2, Loader2 } from "lucide-react"
import { generateQRCode, downloadQRImage, type QRData } from "@/lib/qr-api"

const mockBagData = {
  id: "ECO-123456",
  material: "aluminio",
  location: "Santiago, Providencia",
  contact: "+56 9 1234 5678",
  created: "2023-04-01T10:30:00Z",
  status: "active",
}

export default function BolsaDetalle({ params }: { params: Promise<{ id: string }> }) {
  const [bagId, setBagId] = useState<string>("")
  const [bag, setBag] = useState<typeof mockBagData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null)

  const showToast = (title: string, description: string) => {
    setToast({ title, description })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    params.then((resolved) => {
      const safeId = resolved.id.replace(/[^a-zA-Z0-9\-_]/g, "").slice(0, 50)
      setBagId(safeId)
      setBag({
        ...mockBagData,
        id: safeId,
      })
      setLoading(false)
    })
  }, [params])

  useEffect(() => {
    async function loadQR() {
      if (bag) {
        setQrLoading(true)
        try {
          const qrData: QRData = {
            id: bag.id,
            material: bag.material,
            location: bag.location,
            contact: bag.contact,
            created: bag.created,
          }
          const qrUrl = await generateQRCode(qrData)
          setQrImageUrl(qrUrl)
        } catch (error) {
          console.error("Error loading QR:", error)
        } finally {
          setQrLoading(false)
        }
      }
    }
    loadQR()
  }, [bag])

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
        return "bg-emerald-100 text-emerald-800"
      case "mixto":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const downloadQR = () => {
    if (qrImageUrl && bag) {
      downloadQRImage(qrImageUrl, `latas-x-cash-${bag.id}.png`)
      showToast("QR descargado", "El codigo QR ha sido descargado correctamente.")
    }
  }

  const shareQR = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `LATAS X CA$H - Bolsa ${bag?.id}`,
          text: `Bolsa de reciclaje de ${bag?.material} en ${bag?.location}. Contacto: ${bag?.contact}`,
          url: window.location.href,
        })
      } catch (error) {
        showToast("Error al compartir", "No se pudo compartir el contenido.")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast("Enlace copiado", "El enlace ha sido copiado al portapapeles.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    )
  }

  if (!bag) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-10 px-4">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Bolsa no encontrada</h2>
            <p className="text-gray-500 mb-6">La bolsa con ID {bagId} no existe o ha sido eliminada.</p>
            <Link href="/">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors">
                Volver al inicio
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border-l-4 border-green-500 max-w-sm">
          <p className="font-semibold text-gray-900">{toast.title}</p>
          <p className="text-sm text-gray-600">{toast.description}</p>
        </div>
      )}

      <div className="bg-gradient-to-b from-yellow-100 via-lime-100 to-green-100 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link
              href="/mis-bolsas"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a mis bolsas
            </Link>
          </div>
          <div className="text-center">
            <span className="inline-block bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
              Detalles de la bolsa
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">LATAS X CA$H</h1>
            <p className="text-gray-600">Informacion detallada y codigo QR</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {/* Bag Info Card */}
          <div className="bg-white shadow-lg rounded-2xl p-5 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{bag.id}</h2>
              <span
                className={`${getMaterialColor(bag.material)} text-xs font-medium px-3 py-1 rounded-full capitalize`}
              >
                {bag.material}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Ubicacion</span>
                <span className="font-medium text-gray-900">{bag.location}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Contacto</span>
                <span className="font-medium text-gray-900">{bag.contact}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Fecha de creacion</span>
                <span className="font-medium text-gray-900">{formatDate(bag.created)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <span className="text-gray-500">Estado</span>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">Activo</span>
              </div>
            </div>

            <div className="mt-8 bg-green-50 p-5 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Instrucciones para compradores</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Escanea el codigo QR para verificar el contenido</li>
                <li>Contacta al vendedor usando la informacion de contacto</li>
                <li>Coordina la recoleccion o entrega del material</li>
                <li>Realiza el pago segun lo acordado</li>
              </ol>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-white shadow-lg rounded-2xl p-5 md:p-6 flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-green-600">LATAS X CA$H</h2>
            <p className="text-sm text-gray-500 mb-6">Escanea para ver detalles</p>

            <div className="bg-white p-3 md:p-4 rounded-2xl mb-6 border-4 border-green-500 shadow-lg min-h-[280px] flex items-center justify-center">
              {qrLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-green-600" />
              ) : qrImageUrl ? (
                <img
                  src={qrImageUrl || "/placeholder.svg"}
                  alt={`QR Code for ${bag.id}`}
                  width={250}
                  height={250}
                  className="w-[200px] h-[200px] md:w-[250px] md:h-[250px]"
                />
              ) : (
                <p className="text-gray-500">Error al cargar QR</p>
              )}
            </div>

            <div className="text-center mb-6 space-y-1">
              <h3 className="font-semibold text-lg text-gray-900">{bag.id}</h3>
              <p className="text-sm text-gray-500 capitalize">Material: {bag.material}</p>
              <p className="text-sm text-gray-500">{bag.location}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                onClick={downloadQR}
                disabled={!qrImageUrl}
              >
                <Download className="h-4 w-4" />
                Descargar QR
              </button>
              <button
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                onClick={shareQR}
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
