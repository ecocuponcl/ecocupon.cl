"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3, TrendingUp, Recycle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for demonstration
const mockData = {
  totalBags: 12,
  activeBags: 3,
  completedBags: 9,
  totalWeight: 45.5, // kg
  totalEarnings: 22750, // CLP
  materialBreakdown: {
    aluminio: 18.2,
    vidrio: 27.3,
    mixto: 0,
  },
  monthlyData: [
    { month: "Enero", bags: 2, weight: 7.5, earnings: 3750 },
    { month: "Febrero", bags: 3, weight: 11.0, earnings: 5500 },
    { month: "Marzo", bags: 4, weight: 15.0, earnings: 7500 },
    { month: "Abril", bags: 3, weight: 12.0, earnings: 6000 },
  ],
}

export default function Estadisticas() {
  const [data] = useState(mockData)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount)
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
        <p className="text-xl font-semibold text-green-600 mb-2">Estadísticas de Reciclaje</p>
        <p className="text-muted-foreground max-w-2xl">
          Visualiza el impacto de tu reciclaje y los beneficios obtenidos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bolsas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBags}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.activeBags} activas, {data.completedBags} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Total Reciclado</CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalWeight} kg</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aluminio: {data.materialBreakdown.aluminio} kg, Vidrio: {data.materialBreakdown.vidrio} kg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancias Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Promedio: {formatCurrency(data.totalEarnings / data.totalBags)} por bolsa
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">Datos Mensuales</TabsTrigger>
          <TabsTrigger value="materials">Por Material</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Progreso Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {data.monthlyData.map((month) => (
                  <div key={month.month} className="flex items-center">
                    <div className="w-20 text-sm">{month.month}</div>
                    <div className="w-full">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between text-sm">
                            <div>Bolsas: {month.bags}</div>
                            <div>{month.weight} kg</div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-green-600"
                              style={{ width: `${(month.weight / data.totalWeight) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right text-sm font-medium">{formatCurrency(month.earnings)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Material</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="flex items-center">
                  <div className="w-20 text-sm">Aluminio</div>
                  <div className="w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <div>{data.materialBreakdown.aluminio} kg</div>
                          <div>{Math.round((data.materialBreakdown.aluminio / data.totalWeight) * 100)}%</div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${(data.materialBreakdown.aluminio / data.totalWeight) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium">
                        {formatCurrency(data.materialBreakdown.aluminio * 500)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-20 text-sm">Vidrio</div>
                  <div className="w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <div>{data.materialBreakdown.vidrio} kg</div>
                          <div>{Math.round((data.materialBreakdown.vidrio / data.totalWeight) * 100)}%</div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-green-600"
                            style={{ width: `${(data.materialBreakdown.vidrio / data.totalWeight) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium">
                        {formatCurrency(data.materialBreakdown.vidrio * 500)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-20 text-sm">Mixto</div>
                  <div className="w-full">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <div>{data.materialBreakdown.mixto} kg</div>
                          <div>{Math.round((data.materialBreakdown.mixto / data.totalWeight) * 100)}%</div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-purple-600"
                            style={{ width: `${(data.materialBreakdown.mixto / data.totalWeight) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium">
                        {formatCurrency(data.materialBreakdown.mixto * 500)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-10 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Estas estadísticas son una simulación. En una aplicación real, se calcularían basadas en tus datos reales.
        </p>
        <Link href="/crear-qr">
          <Button className="bg-green-600 hover:bg-green-700">Crear Nueva Bolsa de Reciclaje</Button>
        </Link>
      </div>
    </div>
  )
}
