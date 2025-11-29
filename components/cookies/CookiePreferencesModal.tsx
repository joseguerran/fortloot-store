'use client'

import { useState, useEffect } from 'react'
import { useConsent, type ConsentState } from '@/context/ConsentContext'
import { X, Cookie, Shield, BarChart3, Target, Check } from 'lucide-react'

interface CookiePreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

interface CookieCategory {
  id: keyof ConsentState
  name: string
  description: string
  icon: React.ReactNode
  locked?: boolean
}

const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Necesarias',
    description: 'Cookies esenciales para el funcionamiento del sitio. Incluyen sesion de usuario, carrito de compras y preferencias de seguridad. No se pueden desactivar.',
    icon: <Shield className="w-5 h-5" />,
    locked: true,
  },
  {
    id: 'preferences',
    name: 'Preferencias',
    description: 'Permiten recordar tus preferencias como idioma, region y configuracion de visualizacion para ofrecerte una experiencia personalizada.',
    icon: <Cookie className="w-5 h-5" />,
  },
  {
    id: 'analytics',
    name: 'Analiticas',
    description: 'Nos ayudan a entender como usas el sitio mediante Google Analytics y Microsoft Clarity. Esto nos permite mejorar la experiencia de usuario.',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Utilizadas para mostrarte anuncios relevantes y medir la efectividad de nuestras campanas publicitarias.',
    icon: <Target className="w-5 h-5" />,
  },
]

export function CookiePreferencesModal({ isOpen, onClose }: CookiePreferencesModalProps) {
  const { consent, updateConsent, acceptAll, rejectAll, setShowBanner } = useConsent()
  const [localConsent, setLocalConsent] = useState<ConsentState>(consent)

  // Sincronizar estado local cuando cambia el consent global
  useEffect(() => {
    setLocalConsent(consent)
  }, [consent])

  if (!isOpen) return null

  const handleToggle = (categoryId: keyof ConsentState) => {
    if (categoryId === 'necessary') return // No se puede desactivar

    setLocalConsent(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const handleSave = () => {
    updateConsent(localConsent)
    setShowBanner(false)
    onClose()
  }

  const handleAcceptAll = () => {
    acceptAll()
    onClose()
  }

  const handleRejectAll = () => {
    rejectAll()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0D1B2A] border border-[#1B263B] rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1B263B]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00F5D4]/10 rounded-lg">
              <Cookie className="w-5 h-5 text-[#00F5D4]" />
            </div>
            <h2 className="text-white font-bold text-lg">Preferencias de Cookies</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-gray-400 text-sm mb-6">
            Gestiona tus preferencias de cookies. Puedes activar o desactivar las categorias
            que desees. Las cookies necesarias siempre estan activas para garantizar el
            funcionamiento del sitio.
          </p>

          {/* Categories */}
          <div className="space-y-4">
            {COOKIE_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`p-4 rounded-lg border transition-colors ${
                  localConsent[category.id]
                    ? 'bg-[#00F5D4]/5 border-[#00F5D4]/30'
                    : 'bg-[#1B263B]/50 border-[#1B263B]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      localConsent[category.id]
                        ? 'bg-[#00F5D4]/20 text-[#00F5D4]'
                        : 'bg-[#1B263B] text-gray-400'
                    }`}>
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium text-sm">{category.name}</h3>
                        {category.locked && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#00F5D4]/20 text-[#00F5D4] rounded font-medium">
                            Siempre activo
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(category.id)}
                    disabled={category.locked}
                    className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors ${
                      localConsent[category.id]
                        ? 'bg-[#00F5D4]'
                        : 'bg-[#1B263B]'
                    } ${category.locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    aria-label={`${localConsent[category.id] ? 'Desactivar' : 'Activar'} ${category.name}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform bg-white flex items-center justify-center ${
                        localConsent[category.id] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    >
                      {localConsent[category.id] && (
                        <Check className="w-3 h-3 text-[#00F5D4]" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#1B263B] space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleRejectAll}
              className="flex-1 px-4 py-2.5 border border-gray-600 text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              Rechazar todo
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2.5 border border-[#00F5D4] text-[#00F5D4] rounded-lg font-medium text-sm hover:bg-[#00F5D4]/10 transition-colors"
            >
              Aceptar todo
            </button>
          </div>
          <button
            onClick={handleSave}
            className="w-full px-4 py-2.5 bg-[#00F5D4] text-[#0D1B2A] rounded-lg font-bold text-sm hover:bg-[#00F5D4]/90 transition-colors"
          >
            Guardar mis preferencias
          </button>
        </div>
      </div>
    </div>
  )
}
