"use client"

import type React from "react"

import { memo, useCallback, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { X, Menu } from "lucide-react"
import { useScrollDetection } from "@/hooks/useScrollDetection"
import { scrollToSection } from "@/utils/helpers"
import { CartButton } from "@/components/cart/CartButton"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useMaintenance } from "@/context/AnnouncementContext"

export const Header = memo(() => {
  const t = useTranslations('common.header')
  const locale = useLocale()
  const scrolled = useScrollDetection(50)
  const pathname = usePathname()
  const isStoreView = pathname.includes("/store") || pathname.includes("/tienda")
  const isMisComprasView = pathname.includes("/my-orders") || pathname.includes("/mis-compras")
  const isSimplifiedNav = isStoreView || isMisComprasView
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isInMaintenance, isLoading: maintenanceLoading } = useMaintenance()

  // Determine if maintenance banner is showing (only after loading)
  const showingMaintenanceBanner = !maintenanceLoading && isInMaintenance

  // Navigation items with translations
  const navItems = [
    { name: t('home'), id: "inicio" },
    { name: t('services'), id: "productos" },
    { name: t('howItWorks'), id: "como-funciona" },
    { name: t('paymentMethods'), id: "metodos-de-pago" },
    { name: t('contact'), id: "contacto" },
  ]

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    scrollToSection(id)
    setIsMobileMenuOpen(false)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Localized paths
  const storePath = `/${locale}/store`
  const myOrdersPath = `/${locale}/my-orders`
  const homePath = `/${locale}`

  return (
    <>
      <motion.header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          showingMaintenanceBanner ? "top-[48px]" : "top-0"
        } ${
          scrolled ? "bg-darker shadow-lg py-4" : "bg-transparent py-6"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href={homePath} className="flex items-center" onClick={closeMobileMenu}>
              <span className="text-white font-['Russo_One'] text-3xl">Fort</span>
              <span className="text-primary font-['Russo_One'] text-3xl neon-text">Loot</span>
            </Link>

            <div className="flex items-center gap-4">
              {!isSimplifiedNav ? (
                <nav className="hidden md:flex space-x-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`#${item.id}`}
                      className="text-white hover:text-secondary transition-colors duration-300 relative group"
                      onClick={(e) => handleNavClick(e, item.id)}
                    >
                      {item.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  ))}
                  <Link
                    href={storePath}
                    className="text-white hover:text-secondary transition-colors duration-300 relative group"
                  >
                    {t('store')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link
                    href={myOrdersPath}
                    className="text-white hover:text-secondary transition-colors duration-300 relative group"
                  >
                    {t('myOrders')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </nav>
              ) : (
                <nav className="hidden md:flex space-x-8">
                  <Link
                    href={homePath}
                    className="text-white hover:text-secondary transition-colors duration-300 relative group"
                  >
                    {t('home')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link
                    href={storePath}
                    className="text-white hover:text-secondary transition-colors duration-300 relative group"
                  >
                    {t('store')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  {!isMisComprasView && (
                    <Link
                      href={myOrdersPath}
                      className="text-white hover:text-secondary transition-colors duration-300 relative group"
                    >
                      {t('myOrders')}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  )}
                </nav>
              )}

              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              <CartButton />

              <button className="md:hidden text-white p-2" aria-label={t('menu')} onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
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

            {/* Mobile menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-darker z-50 shadow-xl md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile menu header */}
                <div className="flex justify-between items-center p-6 border-b border-light">
                  <Link href={homePath} className="flex items-center" onClick={closeMobileMenu}>
                    <span className="text-white font-['Russo_One'] text-2xl">Fort</span>
                    <span className="text-primary font-['Russo_One'] text-2xl neon-text">Loot</span>
                  </Link>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-full hover:bg-light transition-colors"
                    aria-label={t('closeMenu')}
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Navigation links */}
                <nav className="flex-1 px-6 py-8">
                  <ul className="space-y-6">
                    {!isSimplifiedNav && navItems.map((item) => (
                      <li key={item.id}>
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
                        href={homePath}
                        className="block text-white text-lg font-medium hover:text-secondary transition-colors duration-300 py-2"
                        onClick={closeMobileMenu}
                      >
                        {t('home')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={storePath}
                        className="block text-white text-lg font-medium hover:text-secondary transition-colors duration-300 py-2"
                        onClick={closeMobileMenu}
                      >
                        {t('store')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={myOrdersPath}
                        className="block text-white text-lg font-medium hover:text-secondary transition-colors duration-300 py-2"
                        onClick={closeMobileMenu}
                      >
                        {t('myOrders')}
                      </Link>
                    </li>
                  </ul>
                </nav>

                {/* Mobile menu footer */}
                <div className="p-6 border-t border-light space-y-4">
                  <LanguageSwitcher />
                  <Link
                    href={storePath}
                    className="block w-full bg-primary hover:bg-secondary text-white text-center font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                    onClick={closeMobileMenu}
                  >
                    {t('goToStore')}
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
