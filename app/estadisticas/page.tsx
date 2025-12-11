"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BarChart3, TrendingUp, Recycle, Plus } from "lucide-react"

const mockData = {
  totalBags: 12,
  activeBags: 3,
  completedBags: 9,
  totalWeight: 45.5,
  totalEarnings: 22750,
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
  const [activeTab, setActiveTab] = useState<"monthly" | "materials">("monthly")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen">
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
              Tu impacto
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">LATAS X CA$H</h1>
            <p className="text-gray-600">Estadisticas de Reciclaje</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Total Bolsas</span>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.totalBags}</p>
            <p className="text-sm text-gray-500 mt-1">
              {data.activeBags} activas, {data.completedBags} completadas
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Peso Total Reciclado</span>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Recycle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.totalWeight} kg</p>
            <p className="text-sm text-gray-500 mt-1">
              Aluminio: {data.materialBreakdown.aluminio} kg, Vidrio: {data.materialBreakdown.vidrio} kg
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 md:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Ganancias Totales</span>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(data.totalEarnings)}</p>
            <p className="text-sm text-gray-500 mt-1">
              Promedio: {formatCurrency(data.totalEarnings / data.totalBags)} por bolsa
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "monthly"
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              Datos Mensuales
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "materials"
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("materials")}
            >
              Por Material
            </button>
          </div>

          <div className="p-5 md:p-6">
            {activeTab === "monthly" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Progreso Mensual</h3>
                <div className="space-y-6">
                  {data.monthlyData.map((month) => (
                    <div key={month.month} className="flex items-center gap-4">
                      <div className="w-16 md:w-20 text-sm font-medium text-gray-700">{month.month}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Bolsas: {month.bags}</span>
                          <span className="text-gray-500">{month.weight} kg</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                            style={{ width: `${(month.weight / data.totalWeight) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-20 md:w-24 text-right text-sm font-semibold text-green-600">
                        {formatCurrency(month.earnings)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "materials" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribucion por Material</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 md:w-20 text-sm font-medium text-gray-700">Aluminio</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">{data.materialBreakdown.aluminio} kg</span>
                        <span className="text-gray-500">
                          {Math.round((data.materialBreakdown.aluminio / data.totalWeight) * 100)}%
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          style={{ width: `${(data.materialBreakdown.aluminio / data.totalWeight) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 md:w-24 text-right text-sm font-semibold text-blue-600">
                      {formatCurrency(data.materialBreakdown.aluminio * 500)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 md:w-20 text-sm font-medium text-gray-700">Vidrio</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">{data.materialBreakdown.vidrio} kg</span>
                        <span className="text-gray-500">
                          {Math.round((data.materialBreakdown.vidrio / data.totalWeight) * 100)}%
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                          style={{ width: `${(data.materialBreakdown.vidrio / data.totalWeight) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 md:w-24 text-right text-sm font-semibold text-emerald-600">
                      {formatCurrency(data.materialBreakdown.vidrio * 500)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 md:w-20 text-sm font-medium text-gray-700">Mixto</div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">{data.materialBreakdown.mixto} kg</span>
                        <span className="text-gray-500">
                          {data.totalWeight > 0
                            ? Math.round((data.materialBreakdown.mixto / data.totalWeight) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                          style={{
                            width: `${data.totalWeight > 0 ? (data.materialBreakdown.mixto / data.totalWeight) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-20 md:w-24 text-right text-sm font-semibold text-amber-600">
                      {formatCurrency(data.materialBreakdown.mixto * 500)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-6">
            Estas estadisticas son una simulacion. En una aplicacion real, se calcularian basadas en tus datos reales.
          </p>
          <Link href="/crear-qr">
            <button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3 font-medium flex items-center gap-2 mx-auto transition-colors">
              <Plus className="h-5 w-5" />
              Crear Nueva Bolsa de Reciclaje
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
