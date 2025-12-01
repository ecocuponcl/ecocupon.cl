import Link from "next/link"
import { PlusCircle, BarChart3, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">LATAS X CA$H</h1>
        <p className="text-xl font-semibold text-green-600 mb-2">EcoCupón - Sistema de Reciclaje</p>
        <p className="text-muted-foreground max-w-2xl">
          Organiza tu reciclaje de aluminio y vidrio, genera códigos QR para tus bolsas y conecta con compradores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <QrCode className="w-10 h-10 mx-auto mb-2 text-green-500" />
            <CardTitle>Generar Código QR</CardTitle>
            <CardDescription>Crea un nuevo código QR para una bolsa de reciclaje</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/crear-qr">
              <Button className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Nuevo QR
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 text-blue-500" />
            <CardTitle>Mis Bolsas</CardTitle>
            <CardDescription>Visualiza y gestiona tus bolsas de reciclaje activas</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/mis-bolsas">
              <Button variant="outline">Ver Mis Bolsas</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 text-orange-500" />
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Visualiza el impacto de tu reciclaje</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/estadisticas">
              <Button variant="outline">Ver Estadísticas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold">1</span>
            </div>
            <h3 className="font-medium mb-1">Compra las bolsas</h3>
            <p className="text-sm text-muted-foreground">Adquiere bolsas de 240-300 litros para tus contenedores</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold">2</span>
            </div>
            <h3 className="font-medium mb-1">Llena la bolsa</h3>
            <p className="text-sm text-muted-foreground">Separa aluminio y vidrio, asegurándote que estén limpios</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold">3</span>
            </div>
            <h3 className="font-medium mb-1">Genera el QR</h3>
            <p className="text-sm text-muted-foreground">Crea un código QR único para cada bolsa de reciclaje</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <span className="font-bold">4</span>
            </div>
            <h3 className="font-medium mb-1">Vende tu reciclaje</h3>
            <p className="text-sm text-muted-foreground">Coordina con compradores y monetiza tu reciclaje</p>
          </div>
        </div>
      </div>
    </div>
  )
}
