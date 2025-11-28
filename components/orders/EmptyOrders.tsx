"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingBag, ArrowRight, Package } from "lucide-react"

interface EmptyOrdersProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export const EmptyOrders = memo(({ hasFilters = false, onClearFilters }: EmptyOrdersProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-6">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-[#FF007A]/20 blur-3xl rounded-full animate-pulse" />

        {/* Icon container */}
        <div className="relative bg-[#1B263B]/70 backdrop-blur-sm p-8 rounded-full border border-[#1B263B]/80">
          <Package className="w-16 h-16 text-gray-500" />
        </div>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">
        {hasFilters ? "No hay órdenes con esos filtros" : "Aún no tienes órdenes"}
      </h3>

      <p className="text-gray-400 text-center mb-8 max-w-md">
        {hasFilters
          ? "Intenta cambiar los filtros para ver más órdenes"
          : "Explora nuestra tienda y encuentra los mejores items de Fortnite para tu colección"}
      </p>

      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B263B] hover:bg-[#1B263B]/80 text-white font-medium rounded-full transition-colors"
        >
          Limpiar filtros
        </button>
      ) : (
        <Link
          href="/tienda"
          className="group inline-flex items-center gap-2 px-6 py-3 bg-[#FF007A] hover:bg-[#FF007A]/90 text-white font-medium rounded-full transition-all shadow-lg shadow-[#FF007A]/20 hover:shadow-[#FF007A]/30"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Ir a la Tienda</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </motion.div>
  )
})

EmptyOrders.displayName = "EmptyOrders"
