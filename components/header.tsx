"use client"

import Link from "next/link"
import { Smartphone, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#fef9c3]/95 backdrop-blur-md border-b border-yellow-200/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg">Ecocupon Chile</span>
              <p className="text-xs text-gray-600 hidden sm:block">Plataforma de Reciclaje con Recompensas</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/crear-qr" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
              Crear QR
            </Link>
            <Link
              href="/mis-bolsas"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Mis Bolsas
            </Link>
            <Link
              href="/estadisticas"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              Estadísticas
            </Link>
          </nav>

          {/* CTA Button - Updated style */}
          <div className="hidden md:flex items-center">
            <Button className="bg-[#1a3a2e] hover:bg-[#143026] text-white rounded-full px-5">
              <Smartphone className="mr-2 h-4 w-4" />
              Descargar App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 flex flex-col gap-4 border-t border-yellow-200/50 mt-3">
            <Link
              href="/crear-qr"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Crear QR
            </Link>
            <Link
              href="/mis-bolsas"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mis Bolsas
            </Link>
            <Link
              href="/estadisticas"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Estadísticas
            </Link>
            <Button className="bg-[#1a3a2e] hover:bg-[#143026] text-white rounded-full w-full">
              <Smartphone className="mr-2 h-4 w-4" />
              Descargar App
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
