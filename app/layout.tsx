import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'EcoCupon.cl',
  description: 'Plataforma de cupones ecológicos',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EcoCupon',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#10b981',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
