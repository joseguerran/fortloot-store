"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { motion, AnimatePresence } from "framer-motion"

export function CartButton() {
  const { toggleCart, totalItems } = useCart()

  return (
    <button
      onClick={toggleCart}
      className="bg-[#ADFF2F] hover:bg-[#9AE600] text-[#0D1B2A] font-medium px-4 py-2 rounded-full transition-colors flex items-center shadow-[0_0_10px_rgba(173,255,47,0.5)] relative"
      aria-label="Carrito de compras"
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      <span className="hidden md:inline">Carrito</span>

      <AnimatePresence>
        {totalItems > 0 && (
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
