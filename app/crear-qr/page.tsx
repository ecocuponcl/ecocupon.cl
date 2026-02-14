"use client"

import type React from "react"
import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Download, Copy, QrCode, Loader2 } from "lucide-react"
import { generateQRCode, downloadQRImage, type QRData } from "@/lib/qr-api"

function sanitize(input: string, maxLength = 100): string {
  return input.replace(/<[^>]*>/g, "").replace(/[<>"'&]/g, "").trim().slice(0, maxLength)
}

export default function CrearQR() {
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
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null)

  const showToast = (title: string, description: string) => {
    setToast({ title, description })
    setTimeout(() => setToast(null), 3000)
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: sanitize(value, name === "notes" ? 200 : 100) }))
  }, [])

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
      showToast("QR generado con éxito", "El código QR ha sido generado y está listo para usar.")
    } catch (error) {
      showToast("Error al generar QR", "Hubo un problema al generar el código QR. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadQR = () => {
    if (qrImageUrl) {
      downloadQRImage(qrImageUrl, `latas-x-cash-${formData.id}.png`)
      showToast("QR descargado", "El código QR ha sido descargado correctamente.")
    }
  }

  const copyQRLink = () => {
    const qrLink = `https://ecocupon.cl/bolsa/${formData.id}`
    navigator.clipboard.writeText(qrLink)
    showToast("Enlace copiado", "El enlace del QR ha sido copiado al portapapeles.")
  }

  return (
    <div className="min-h-screen">
      {/* Toast notification */}
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
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </div>

          <div className="text-center mb-6 md:mb-8">
            <span className="inline-block bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
              Genera tu código
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">LATAS X CA$H</h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Crea un código QR único para tu bolsa de reciclaje que contenga toda la información necesaria
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {/* Form */}
          <div className="bg-white shadow-lg rounded-2xl border-0 p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div className="space-y-2">
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                  ID de la Bolsa
                </label>
                <input
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-700"
                />
                <p className="text-xs text-gray-500">ID generado automáticamente</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Tipo de Material</label>
                <div className="flex flex-col space-y-2">
                  {[
                    { value: "aluminio", label: "Aluminio (Latas)" },
                    { value: "vidrio", label: "Vidrio (Botellas)" },
                    { value: "mixto", label: "Mixto (Aluminio y Vidrio)" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.material === option.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="material"
                        value={option.value}
                        checked={formData.material === option.value}
                        onChange={() => handleRadioChange(option.value)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <input
                  id="location"
                  name="location"
                  placeholder="Comuna, Sector"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                  Contacto
                </label>
                <input
                  id="contact"
                  name="contact"
                  placeholder="WhatsApp o teléfono"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Detalles adicionales sobre el contenido, horarios de disponibilidad, etc."
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    Generar Código QR
                  </>
                )}
              </button>
            </form>
          </div>

          {/* QR Preview */}
          <div className="flex items-start justify-center">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 md:p-8">
              {qrGenerated && qrImageUrl ? (
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-green-600">LATAS X CA$H</h2>
                  <p className="text-sm text-gray-500 mb-6">Escanea para ver detalles</p>

                  <div className="bg-white p-3 md:p-4 rounded-2xl mb-6 border-4 border-green-500 shadow-lg">
                    <img
                      src={qrImageUrl || "/placeholder.svg"}
                      alt={`QR Code for ${formData.id}`}
                      width={250}
                      height={250}
                      className="w-[200px] h-[200px] md:w-[250px] md:h-[250px]"
                    />
                  </div>

                  <div className="text-center mb-6 space-y-1">
                    <h3 className="font-semibold text-lg">{formData.id}</h3>
                    <p className="text-sm text-gray-500 capitalize">Material: {formData.material}</p>
                    <p className="text-sm text-gray-500">{formData.location}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      onClick={downloadQR}
                    >
                      <Download className="h-4 w-4" />
                      Descargar QR
                    </button>
                    <button
                      className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      onClick={copyQRLink}
                    >
                      <Copy className="h-4 w-4" />
                      Copiar enlace
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8 md:py-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-green-600">LATAS X CA$H</h2>
                  <p className="text-sm text-gray-500 mb-6 md:mb-8">Vista previa del QR</p>

                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                    <QrCode className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
                  </div>

                  <p className="text-sm text-gray-500 max-w-xs">
                    Completa el formulario y genera tu código QR para visualizarlo aquí
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
