import Link from "next/link"
import { Instagram, PhoneIcon as WhatsApp } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-green-50 border-t mt-auto">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground max-w-md">
              Haz tus acciones ecológicas realidad y obtiene beneficios de ello - Solo en Chile
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://www.instagram.com/ecocupon.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-green-600 transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span className="hidden sm:inline">Instagram</span>
            </Link>

            <Link
              href="https://wa.me/56979540471"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-green-600 transition-colors"
            >
              <WhatsApp className="h-5 w-5" />
              <span className="hidden sm:inline">Contactar por WhatsApp</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-muted-foreground">&copy; 2024 EcoCupon. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

