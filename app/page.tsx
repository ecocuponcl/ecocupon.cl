import Link from "next/link"
import { Camera, Recycle, MapPin, Calendar, Users, AlertTriangle, QrCode, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Updated to match EcoCupon exactly */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-block">
                <span className="bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-2 shadow-lg">
                  <span className="text-yellow-300">$</span> Gana dinero reciclando
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                Fotografía tu <br className="hidden sm:block" />
                basura, <span className="text-green-600">recibe recompensas</span>
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Únete a la revolución del reciclaje. Toma fotos de tus residuos, recíclalos correctamente y recibe
                dinero por cada acción ecológica que realices.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/crear-qr">
                  <Button
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 rounded-full px-6 py-6 text-base w-full sm:w-auto shadow-lg"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Comenzar a ganar
                  </Button>
                </Link>
                <Link href="#como-funciona">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-6 py-6 text-base w-full sm:w-auto border-2 border-gray-300 bg-white hover:bg-gray-50"
                  >
                    Ver cómo funciona
                  </Button>
                </Link>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-10 pt-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">$50.000+</p>
                  <p className="text-sm text-green-600 font-medium">Pagados este mes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">15.000+</p>
                  <p className="text-sm text-green-600 font-medium">Usuarios activos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">2.5M</p>
                  <p className="text-sm text-green-600 font-medium">Fotos procesadas</p>
                </div>
              </div>
            </div>

            {/* Right Content - App Preview Card */}
            <div className="flex justify-center lg:justify-end">
              <Card className="w-full max-w-sm shadow-2xl rounded-3xl border-0 overflow-hidden">
                <CardContent className="p-6 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-semibold text-gray-900">Ecocupon App</span>
                    <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">En vivo</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Camera className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Foto subida</p>
                        <p className="text-sm text-green-600">Botella plástica · +$150</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <span className="text-green-600 font-bold">$</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Recompensa</p>
                        <p className="text-sm text-green-600">Transferencia procesada</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Recycle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Impacto</p>
                        <p className="text-sm text-green-600">+1 punto ecológico</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="como-funciona" className="gradient-features py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Conecta con la gestión inteligente de residuos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Una plataforma completa que te recompensa por reciclar y te ayuda a gestionar tus residuos de manera
              eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Camera,
                title: "Fotografía y Gana",
                description: "Toma fotos de tus residuos y recibe dinero por cada imagen verificada",
              },
              {
                icon: Recycle,
                title: "Reciclaje Inteligente",
                description: "Aprende cómo reciclar correctamente cada tipo de residuo con nuestra IA",
              },
              {
                icon: MapPin,
                title: "Puntos de Reciclaje",
                description: "Encuentra los puntos de reciclaje más cercanos a tu ubicación",
              },
              {
                icon: Calendar,
                title: "Calendario Ecológico",
                description: "Programa recordatorios para días de recolección y eventos de reciclaje",
              },
              {
                icon: Users,
                title: "Comunidad Verde",
                description: "Únete a una comunidad comprometida con el medio ambiente",
              },
              {
                icon: AlertTriangle,
                title: "Reportes Ambientales",
                description: "Reporta problemas ambientales y ayuda a mantener Chile limpio",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-yellow-200/80 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="h-8 w-8 text-yellow-700" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Green gradient */}
      <section className="gradient-stats py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: "2.5M", label: "Fotos procesadas" },
              { value: "850 Ton", label: "Residuos reciclados" },
              { value: "$2.8M", label: "Pagado en recompensas" },
              { value: "15.000+", label: "Usuarios activos" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-green-100 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATAS X CA$H Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">LATAS X CA$H</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Organiza tu reciclaje de aluminio y vidrio, genera códigos QR para tus bolsas y conecta con compradores
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Compra las bolsas",
                desc: "Adquiere bolsas de 240-300 litros para tus contenedores",
              },
              { step: "2", title: "Llena la bolsa", desc: "Separa aluminio y vidrio, asegurándote que estén limpios" },
              { step: "3", title: "Genera el QR", desc: "Crea un código QR único para cada bolsa de reciclaje" },
              { step: "4", title: "Vende tu reciclaje", desc: "Coordina con compradores y monetiza tu reciclaje" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5 shadow-md">
                  <span className="text-2xl font-bold text-green-600">{item.step}</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/crear-qr">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full px-8 py-6 text-base shadow-lg">
                <QrCode className="mr-2 h-5 w-5" />
                Crear mi primer QR
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-cta py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Cómo podemos ayudarte hoy?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10 text-lg">
            Descarga la app, comienza a fotografiar tus residuos y empieza a ganar dinero mientras cuidas el planeta
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full px-8 py-6 text-base shadow-lg">
              <Smartphone className="mr-2 h-5 w-5" />
              Descargar para iOS
            </Button>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full px-8 py-6 text-base shadow-lg">
              <Smartphone className="mr-2 h-5 w-5" />
              Descargar para Android
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
