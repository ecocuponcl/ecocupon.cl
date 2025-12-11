import Link from "next/link"
import { Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-green-900 text-white">
      <div className="container mx-auto py-10 md:py-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Logo & Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
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
              <span className="font-bold text-lg">Ecocupon Chile</span>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Haz tus acciones ecológicas realidad y obtiene beneficios de ello - Solo en Chile
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h4 className="font-semibold mb-4 md:mb-5 text-white">Servicios</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/crear-qr" className="hover:text-white transition-colors">
                  Crear QR
                </Link>
              </li>
              <li>
                <Link href="/mis-bolsas" className="hover:text-white transition-colors">
                  Mis Bolsas
                </Link>
              </li>
              <li>
                <Link href="/estadisticas" className="hover:text-white transition-colors">
                  Estadísticas
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h4 className="font-semibold mb-4 md:mb-5 text-white">Soporte</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold mb-4 md:mb-5 text-white">Contacto</h4>
            <div className="flex items-center gap-3">
              <Link
                href="https://www.instagram.com/ecocupon.cl"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="https://wa.me/56979540471"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400">2024 EcoCupon. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
