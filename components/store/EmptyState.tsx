"use client"

import { memo } from "react"
import { motion } from "framer-motion"

interface EmptyStateProps {
  onReset: () => void
}

export const EmptyState = memo(({ onReset }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16 bg-[#1B263B]/50 rounded-lg"
    >
      <div className="mx-auto w-16 h-16 mb-4 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No se encontraron artículos</h3>
      <p className="text-gray-400 max-w-md mx-auto">
        No hay artículos que coincidan con tu búsqueda. Intenta con otros filtros o términos de búsqueda.
      </p>
      <button
        onClick={onReset}
        className="mt-4 bg-[#00F5D4] hover:bg-[#FF007A] text-[#0D1B2A] font-medium px-6 py-2 rounded-full transition-colors"
      >
        Mostrar todos los artículos
      </button>
    </motion.div>
  )
})

EmptyState.displayName = "EmptyState"
