"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, QrCode, Trash2, ExternalLink, Plus } from "lucide-react"

const initialBags = [
  {
    id: "ECO-123456",
    material: "aluminio",
    location: "Santiago, Providencia",
    contact: "+56 9 1234 5678",
    created: "2023-04-01T10:30:00Z",
    status: "active",
  },
  {
    id: "ECO-789012",
    material: "vidrio",
    location: "Santiago, Las Condes",
    contact: "+56 9 8765 4321",
    created: "2023-04-02T14:45:00Z",
    status: "active",
  },
  {
    id: "ECO-345678",
    material: "mixto",
    location: "Santiago, Ñuñoa",
    contact: "+56 9 2468 1357",
    created: "2023-04-03T09:15:00Z",
    status: "active",
  },
]

export default function MisBolsas() {
  const [bags, setBags] = useState(initialBags)
  const [toast, setToast] = useState<{ title: string; description: string } | null>(null)

  const showToast = (title: string, description: string) => {
    setToast({ title, description })
    setTimeout(() => setToast(null), 3000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const handleDelete = (id: string) => {
    setBags(bags.filter((bag) => bag.id !== id))
    showToast("Bolsa eliminada", `La bolsa ${id} ha sido eliminada correctamente.`)
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

          <div className="text-center">
            <span className="inline-block bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
              Gestiona tu reciclaje
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">LATAS X CA$H</h1>
            <p className="text-gray-600">Mis Bolsas de Reciclaje</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="flex justify-end mb-6">
          <Link href="/crear-qr">
            <button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2.5 font-medium flex items-center gap-2 transition-colors">
              <Plus className="h-4 w-4" />
              Crear Nueva Bolsa
            </button>
          </Link>
        </div>

        {bags.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl">
            <div className="flex flex-col items-center justify-center text-center p-10 md:p-12">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                <QrCode className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No tienes bolsas activas</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">
                Crea tu primera bolsa de reciclaje para comenzar a gestionar tu reciclaje
              </p>
              <Link href="/crear-qr">
                <button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2.5 font-medium flex items-center gap-2 transition-colors">
                  <Plus className="h-4 w-4" />
                  Crear Primera Bolsa
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {bags.map((bag) => (
              <div
                key={bag.id}
                className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-5 md:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{bag.id}</h3>
                    <span
                      className={`${getMaterialColor(bag.material)} text-xs font-medium px-2.5 py-1 rounded-full capitalize`}
                    >
                      {bag.material}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ubicación:</span>
                      <span className="font-medium text-gray-900">{bag.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contacto:</span>
                      <span className="font-medium text-gray-900">{bag.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Creado:</span>
                      <span className="font-medium text-gray-900">{formatDate(bag.created)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/bolsa/${bag.id}`} className="flex-1">
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm">
                        <ExternalLink className="h-4 w-4" />
                        Ver QR
                      </button>
                    </Link>
                    <button
                      className="px-3 py-2 border border-gray-200 hover:bg-red-50 hover:border-red-200 text-red-500 rounded-lg transition-colors"
                      onClick={() => handleDelete(bag.id)}
                      aria-label="Eliminar bolsa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
