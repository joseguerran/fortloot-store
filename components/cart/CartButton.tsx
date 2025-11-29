"use client"

import { ShoppingCart, Wrench } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useMaintenance } from "@/context/AnnouncementContext"
import { motion, AnimatePresence } from "framer-motion"

export function CartButton() {
  const { toggleCart, totalItems } = useCart()
  const { isInMaintenance } = useMaintenance()

  return (
    <button
      onClick={toggleCart}
      className={`${
        isInMaintenance
          ? 'bg-gray-500 cursor-not-allowed'
          : 'bg-[#ADFF2F] hover:bg-[#9AE600]'
      } text-[#0D1B2A] font-medium px-4 py-2 rounded-full transition-colors flex items-center ${
        !isInMaintenance ? 'shadow-[0_0_10px_rgba(173,255,47,0.5)]' : ''
      } relative`}
      aria-label={isInMaintenance ? "Carrito deshabilitado - En mantenimiento" : "Carrito de compras"}
      title={isInMaintenance ? "Tienda en mantenimiento" : undefined}
    >
      {isInMaintenance ? (
        <Wrench className="w-5 h-5 mr-2" />
      ) : (
        <ShoppingCart className="w-5 h-5 mr-2" />
      )}
      <span className="hidden md:inline">{isInMaintenance ? 'En Mantenimiento' : 'Carrito'}</span>

      <AnimatePresence>
        {totalItems > 0 && !isInMaintenance && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
          >
            {totalItems}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
