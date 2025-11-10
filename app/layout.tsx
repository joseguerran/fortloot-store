import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import { CustomerProvider } from "@/context/CustomerContext"
import { CartProvider } from "@/context/CartContext"
import { ConfigProvider } from "@/context/ConfigContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FortLoot - Gaming Currencies",
  description: "La mejor tienda de monedas y objetos virtuales para tus juegos favoritos.",
    generator: 'v0.dev'
}

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
        <ConfigProvider>
          <CustomerProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <Toaster />
            </CartProvider>
          </CustomerProvider>
        </ConfigProvider>
      </body>
    </html>
  )
}
