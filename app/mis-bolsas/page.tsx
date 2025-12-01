"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, QrCode, Trash2, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Mock data for demonstration
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
        return "bg-blue-100 text-blue-800"
      case "vidrio":
        return "bg-green-100 text-green-800"
      case "mixto":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">LATAS X CA$H</h1>
        <p className="text-xl font-semibold text-green-600 mb-2">Mis Bolsas de Reciclaje</p>
        <p className="text-muted-foreground max-w-2xl">
          Gestiona tus bolsas de reciclaje activas y visualiza su información.
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Link href="/crear-qr">
          <Button className="bg-green-600 hover:bg-green-700">Crear Nueva Bolsa</Button>
        </Link>
      </div>

      {bags.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-10">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No tienes bolsas activas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu primera bolsa de reciclaje para comenzar a gestionar tu reciclaje
            </p>
            <Link href="/crear-qr">
              <Button variant="outline">Crear Primera Bolsa</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bags.map((bag) => (
            <Card key={bag.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{bag.id}</CardTitle>
                  <Badge className={getMaterialColor(bag.material)} variant="outline">
                    {bag.material.charAt(0).toUpperCase() + bag.material.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ubicación:</span>
                    <span>{bag.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contacto:</span>
                    <span>{bag.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Creado:</span>
                    <span>{formatDate(bag.created)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/bolsa/${bag.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver QR
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(bag.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
