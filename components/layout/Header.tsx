"use client"

import type React from "react"

import { memo, useCallback, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, Menu } from "lucide-react"
import { useScrollDetection } from "@/hooks/useScrollDetection"
import { scrollToSection } from "@/utils/helpers"
import { CartButton } from "@/components/cart/CartButton"

const navItems = [
  { name: "Inicio", id: "inicio" },
  { name: "Servicios", id: "productos" },
  { name: "Cómo Funciona", id: "como-funciona" },
  { name: "Métodos de Pago", id: "metodos-de-pago" },
  { name: "Contacto", id: "contacto" },
]

export const Header = memo(() => {
  const scrolled = useScrollDetection(50)
  const pathname = usePathname()
  const isStoreView = pathname.includes("/tienda")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    scrollToSection(id)
    setIsMobileMenuOpen(false) // Cerrar el menú móvil al hacer clic en un enlace
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "bg-darker shadow-lg py-4" : "bg-transparent py-6"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
              <span className="text-white font-['Russo_One'] text-3xl">Fort</span>
              <span className="text-primary font-['Russo_One'] text-3xl neon-text">Loot</span>
            </Link>

            <div className="flex items-center gap-4">
              {!isStoreView && (
                <nav className="hidden md:flex space-x-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={`#${item.id}`}
                      className="text-white hover:text-secondary transition-colors duration-300 relative group"
                      onClick={(e) => handleNavClick(e, item.id)}
                    >
                      {item.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  ))}
                  <Link
                    href="/tienda"
                    className="text-white hover:text-secondary transition-colors duration-300 relative group"
                  >
                    Tienda
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </nav>
              )}
              <CartButton />

              {!isStoreView && (
                <button className="md:hidden text-white p-2" aria-label="Menú" onClick={toggleMobileMenu}>
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Menú móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && !isStoreView && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Menú móvil */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-darker z-50 shadow-xl md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header del menú móvil */}
                <div className="flex justify-between items-center p-6 border-b border-light">
                  <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
                    <span className="text-white font-['Russo_One'] text-2xl">Fort</span>
                    <span className="text-primary font-['Russo_One'] text-2xl neon-text">Loot</span>
                  </Link>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-full hover:bg-light transition-colors"
                    aria-label="Cerrar menú"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Enlaces de navegación */}
                <nav className="flex-1 px-6 py-8">
                  <ul className="space-y-6">
                    {navItems.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={`#${item.id}`}
                          className="block text-white text-lg font-medium hover:text-secondary transition-colors duration-300 py-2"
                          onClick={(e) => handleNavClick(e, item.id)}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/tienda"
                        className="block text-white text-lg font-medium hover:text-secondary transition-colors duration-300 py-2"
                        onClick={closeMobileMenu}
                      >
                        Tienda
                      </Link>
                    </li>
                  </ul>
                </nav>

                {/* Footer del menú móvil */}
                <div className="p-6 border-t border-light">
                  <Link
                    href="/tienda"
                    className="block w-full bg-primary hover:bg-secondary text-white text-center font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                    onClick={closeMobileMenu}
                  >
                    Ir a la Tienda
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

Header.displayName = "Header"
