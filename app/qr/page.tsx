"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Scan } from "lucide-react"

export default function QRPage() {
  const qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <ShoppingBag className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">EcoCupon - Login QR</CardTitle>
          <CardDescription>
            Escanea el código QR para iniciar sesión en tu dispositivo móvil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ecocanasta" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ecocanasta" className="gap-2">
                <Scan className="h-4 w-4" />
                EcoCanasta
              </TabsTrigger>
              <TabsTrigger value="ecocupon" className="gap-2">
                <Scan className="h-4 w-4" />
                EcoCupon
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ecocanasta" className="space-y-4">
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${qrApiUrl}?size=300x300&data=${encodeURIComponent("https://ecocanasta.ecocupon.cl/auth/login")}`}
                  alt="QR Login EcoCanasta"
                  className="rounded-lg border-2 border-primary/20 p-4"
                />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Escanea para iniciar sesión en
                </p>
                <p className="text-center font-medium text-primary">
                  ecocanasta.ecocupon.cl
                </p>
                <a
                  href="https://ecocanasta.ecocupon.cl/auth/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
                >
                  https://ecocanasta.ecocupon.cl/auth/login
                </a>
              </div>
            </TabsContent>

            <TabsContent value="ecocupon" className="space-y-4">
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${qrApiUrl}?size=300x300&data=${encodeURIComponent("https://ecocupon.cl/auth/login")}`}
                  alt="QR Login EcoCupon"
                  className="rounded-lg border-2 border-primary/20 p-4"
                />
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Escanea para iniciar sesión en
                </p>
                <p className="text-center font-medium text-primary">
                  ecocupon.cl
                </p>
                <a
                  href="https://ecocupon.cl/auth/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
                >
                  https://ecocupon.cl/auth/login
                </a>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="text-center text-sm text-muted-foreground">
              Ambos dominios comparten la misma cuenta de Google.
              <br />
              Puedes iniciar sesión en cualquiera de los dos y accederás a ambos sitios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
