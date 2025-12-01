"use client"

import { useCart } from "@/context/CartContext"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { Loader2 } from "lucide-react"

export function OrderSummary() {
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
      </div>
    </div>
  )
}
