"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, QrCode, Trash2, ExternalLink, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()
  const [bags, setBags] = useState(initialBags)

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
    toast({
      title: "Bolsa eliminada",
      description: `La bolsa ${id} ha sido eliminada correctamente.`,
    })
  }

  const getMaterialColor = (material: string) => {
    switch (material) {
      case "aluminio":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "vidrio":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "mixto":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
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

          <div className="text-center">
            <span className="inline-block bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
              Gestiona tu reciclaje
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">LATAS X CA$H</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">Mis Bolsas de Reciclaje</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-end mb-6">
          <Link href="/crear-qr">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" />
              Crear Nueva Bolsa
            </Button>
          </Link>
        </div>

        {bags.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none">
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <QrCode className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No tienes bolsas activas</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Crea tu primera bolsa de reciclaje para comenzar a gestionar tu reciclaje
              </p>
              <Link href="/crear-qr">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primera Bolsa
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bags.map((bag) => (
              <Card key={bag.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{bag.id}</CardTitle>
                    <Badge className={getMaterialColor(bag.material)} variant="outline">
                      {bag.material.charAt(0).toUpperCase() + bag.material.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ubicación:</span>
                      <span className="font-medium">{bag.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contacto:</span>
                      <span className="font-medium">{bag.contact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado:</span>
                      <span className="font-medium">{formatDate(bag.created)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 gap-2">
                  <Button variant="default" size="sm" className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                    <Link href={`/bolsa/${bag.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver QR
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={() => handleDelete(bag.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
