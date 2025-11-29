import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { ConsentProvider } from "@/context/ConsentContext"
import { CustomerProvider } from "@/context/CustomerContext"
import { CartProvider } from "@/context/CartContext"
import { ConfigProvider } from "@/context/ConfigContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { Toaster } from "@/components/ui/toaster"
import { CookieBanner } from "@/components/cookies/CookieBanner"
import { ConditionalAnalytics } from "@/components/analytics/ConditionalAnalytics"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FortLoot - Gaming Currencies",
  description: "La mejor tienda de monedas y objetos virtuales para tus juegos favoritos.",
    generator: 'v0.dev'
}

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Russo+One&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <ConsentProvider>
          <ConfigProvider>
            <CustomerProvider>
              <CartProvider>
                {children}
                <CartDrawer />
                <Toaster />
                <CookieBanner />
              </CartProvider>
            </CustomerProvider>
          </ConfigProvider>
          <ConditionalAnalytics />
        </ConsentProvider>
      </body>
    </html>
  )
}
