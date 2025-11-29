'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useConsent } from '@/context/ConsentContext'
import { CookiePreferencesModal } from './CookiePreferencesModal'
import { Cookie, X } from 'lucide-react'

export function CookieBanner() {
  const { showBanner, setShowBanner, acceptAll, hasConsented } = useConsent()
  const [showPreferences, setShowPreferences] = useState(false)

  // Si ya consintió y el banner no debe mostrarse, no renderizar
  if (!showBanner && hasConsented) return null

  // Si el banner no debe mostrarse, no renderizar
  if (!showBanner) return null

  const handleAcceptAll = () => {
    acceptAll()
    setShowBanner(false)
  }

  const handleCustomize = () => {
    setShowPreferences(true)
  }

  const handleClosePreferences = () => {
    setShowPreferences(false)
  }

  return (
    <>
      {/* Banner principal - fijo en la parte inferior */}
      {!showPreferences && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D1B2A] border-t border-[#1B263B] shadow-2xl">
          <div className="container mx-auto px-4 py-4 md:py-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
              {/* Icono y texto */}
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-[#00F5D4]/10 rounded-lg flex-shrink-0">
                  <Cookie className="w-6 h-6 text-[#00F5D4]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm md:text-base mb-1">
                    Usamos cookies
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    Utilizamos cookies para mejorar tu experiencia, analizar el trafico del sitio y personalizar contenido.
                    Al hacer clic en &quot;Aceptar todo&quot;, aceptas el uso de todas las cookies.{' '}
                    <Link
                      href="/privacidad"
                      className="text-[#00F5D4] hover:underline font-medium"
                    >
                      Politica de privacidad
                    </Link>
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleCustomize}
                  className="flex-1 md:flex-none px-4 py-2.5 border border-[#00F5D4] text-[#00F5D4] rounded-lg font-medium text-sm hover:bg-[#00F5D4]/10 transition-colors"
                >
                  Personalizar
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-[#00F5D4] text-[#0D1B2A] rounded-lg font-bold text-sm hover:bg-[#00F5D4]/90 transition-colors"
                >
                  Aceptar todo
                </button>
              </div>

              {/* Botón cerrar (solo en móvil, oculta el banner sin aceptar) */}
              <button
                onClick={() => setShowBanner(false)}
                className="absolute top-2 right-2 md:hidden p-1 text-gray-500 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de preferencias */}
      <CookiePreferencesModal
        isOpen={showPreferences}
        onClose={handleClosePreferences}
      />
    </>
  )
}
