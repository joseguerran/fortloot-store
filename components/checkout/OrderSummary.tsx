"use client"

import { useCart } from "@/context/CartContext"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { Loader2, Clock } from "lucide-react"
import { format } from "date-fns"

interface ConversionInfo {
  convertedAmount: number
  convertedCurrency: string
  validUntil: Date
}

interface OrderSummaryProps {
  conversionInfo?: ConversionInfo | null
  isLoadingConversion?: boolean
}

export function OrderSummary({ conversionInfo, isLoadingConversion }: OrderSummaryProps = {}) {
  const { cartItems, cartTotal, isLoadingPrices, totalPrice } = useCart()

  return (
    <div className="bg-dark border border-light rounded-lg p-6">
      <h2 className="text-2xl font-russo text-white mb-4">Resumen de Orden</h2>

      <div className="space-y-4 mb-6">
        {cartItems.map((item) => {
          // El precio viene en centavos desde el catálogo, convertir a USD
          const itemPrice = (item.price?.finalPrice || 0) / 100
          const totalItemPrice = itemPrice * item.quantity
          return (
            <div key={item.id} className="flex gap-3">
              <div className="w-14 h-14 relative flex-shrink-0">
                <OptimizedImage src={item.image} alt={item.name} fill className="object-cover rounded" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{item.name}</h3>
                <p className="text-xs text-gray-400">Cantidad: {item.quantity}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-accent font-bold text-sm">
                  ${totalItemPrice.toFixed(2)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-light pt-4 space-y-2">
        {cartTotal && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">${cartTotal.subtotal.toFixed(2)}</span>
            </div>
            {cartTotal.totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Descuento:</span>
                <span className="text-green-500">-${cartTotal.totalDiscount.toFixed(2)}</span>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-light">
          <span className="text-white">Total:</span>
          <span className="text-accent">
            {isLoadingPrices ? <Loader2 className="w-5 h-5 animate-spin inline" /> : `$${totalPrice.toFixed(2)}`}
          </span>
        </div>

        {/* Precio convertido (ej: VES para Pago Móvil) */}
        {isLoadingConversion && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        )}
        {conversionInfo && !isLoadingConversion && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-300 font-medium">Total a pagar:</span>
              <span className="text-2xl font-bold text-blue-400">
                {conversionInfo.convertedAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} {conversionInfo.convertedCurrency}
              </span>
            </div>
            {conversionInfo.validUntil && (
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-300/70">
                <Clock className="w-3 h-3" />
                <span>
                  Precio valido hasta las {format(new Date(conversionInfo.validUntil), 'h:mm a')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
