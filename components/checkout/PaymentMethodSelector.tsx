"use client"

import { useState, useEffect } from "react"
import { Building2, Wallet, Loader2, Bitcoin, Sparkles } from "lucide-react"

interface PaymentMethod {
  id: string
  slug: string
  name: string
  icon?: string
  description?: string
  isActive: boolean
  displayOrder: number
}

interface CryptoAvailability {
  available: boolean
  currencies: string[]
}

interface PaymentMethodSelectorProps {
  selectedMethod: string | null
  onSelect: (methodId: string) => void
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Wallet,
  Bitcoin,
}

export function PaymentMethodSelector({ selectedMethod, onSelect }: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [cryptoAvailable, setCryptoAvailable] = useState<CryptoAvailability | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentMethods()
    fetchCryptoAvailability()
  }, [])

  const fetchCryptoAvailability = async () => {
    try {
      const response = await fetch('/api/crypto/availability')
      const data = await response.json()
      if (data.success) {
        setCryptoAvailable(data.data)
      }
    } catch {
      // Silently fail - crypto will just not show
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/payment-methods?active=true')
      const data = await response.json()

      if (data.success) {
        setMethods(data.data)
      } else {
        throw new Error('Failed to fetch payment methods')
      }
    } catch {
      setError('Error al cargar métodos de pago')
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return <Wallet className="w-6 h-6" />
    const IconComponent = ICON_MAP[iconName]
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <Wallet className="w-6 h-6" />
  }
  if (isLoading) {
    return (
      <div className="bg-dark border border-light rounded-lg p-6">
        <h2 className="text-2xl font-russo text-white mb-4">Método de Pago</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-dark border border-light rounded-lg p-6">
        <h2 className="text-2xl font-russo text-white mb-4">Método de Pago</h2>
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={fetchPaymentMethods}
            className="mt-3 text-sm text-white underline hover:text-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (methods.length === 0) {
    return (
      <div className="bg-dark border border-light rounded-lg p-6">
        <h2 className="text-2xl font-russo text-white mb-4">Método de Pago</h2>
        <p className="text-gray-400">No hay métodos de pago disponibles en este momento.</p>
      </div>
    )
  }

  return (
    <div className="bg-dark border border-light rounded-lg p-6">
      <h2 className="text-2xl font-russo text-white mb-4">Metodo de Pago</h2>
      <p className="text-gray-400 mb-6">Selecciona como deseas pagar tu orden</p>

      <div className="grid gap-4">
        {/* Crypto Payment Option - Shown first if available */}
        {cryptoAvailable?.available && (
          <button
            onClick={() => onSelect('crypto')}
            className={`p-6 border-2 rounded-lg transition-all text-left relative overflow-hidden ${
              selectedMethod === 'crypto'
                ? "border-green-500 bg-green-500/10"
                : "border-green-500/50 hover:border-green-500 hover:bg-green-500/5"
            }`}
          >
            {/* Recommended badge */}
            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Recomendado
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedMethod === 'crypto' ? "bg-green-500/20 text-green-500" : "bg-darker text-green-400"
                }`}
              >
                <Bitcoin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">Pago con Crypto</h3>
                <p className="text-sm text-gray-400">
                  Paga con {cryptoAvailable.currencies.join(' o ')} - Procesamiento automatico
                </p>
              </div>
              {selectedMethod === 'crypto' && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        )}

        {/* Separator */}
        {cryptoAvailable?.available && methods.length > 0 && (
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-light"></div>
            <span className="text-sm text-gray-500">O paga manualmente</span>
            <div className="flex-1 h-px bg-light"></div>
          </div>
        )}

        {/* Manual Payment Methods */}
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.slug)}
            className={`p-6 border-2 rounded-lg transition-all text-left ${
              selectedMethod === method.slug
                ? "border-primary bg-primary/10 neon-border-cyan"
                : "border-light hover:border-secondary hover:bg-secondary/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedMethod === method.slug ? "bg-primary/20 text-primary" : "bg-darker text-gray-400"
                }`}
              >
                {getIcon(method.icon)}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{method.name}</h3>
                {method.description && <p className="text-sm text-gray-400">{method.description}</p>}
              </div>
              {selectedMethod === method.slug && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
