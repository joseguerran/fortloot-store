"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { ShoppingCart, Wrench, Plus } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useMaintenance } from "@/context/AnnouncementContext"
import { motion, AnimatePresence } from "framer-motion"

export function CartButton() {
  const t = useTranslations('common.cart')
  const tMaintenance = useTranslations('checkout.maintenance')
  const { toggleCart, totalItems } = useCart()
  const { isInMaintenance } = useMaintenance()
  const [showPlus, setShowPlus] = useState(false)
  const prevTotalRef = useRef(totalItems)

  // Detect when an item is added
  useEffect(() => {
    if (totalItems > prevTotalRef.current && totalItems > 0) {
      setShowPlus(true)
      const timer = setTimeout(() => setShowPlus(false), 600)
      return () => clearTimeout(timer)
    }
    prevTotalRef.current = totalItems
  }, [totalItems])

  const hasItems = totalItems > 0 && !isInMaintenance

  return (
    <motion.button
      onClick={toggleCart}
      animate={hasItems ? {
        boxShadow: [
          "0 0 10px rgba(173, 255, 47, 0.5)",
          "0 0 20px rgba(173, 255, 47, 0.8)",
          "0 0 10px rgba(173, 255, 47, 0.5)",
          "0 0 20px rgba(173, 255, 47, 0.8)",
          "0 0 10px rgba(173, 255, 47, 0.5)",
        ]
      } : { boxShadow: !isInMaintenance ? "0 0 10px rgba(173, 255, 47, 0.5)" : "none" }}
      transition={hasItems ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : { duration: 0.3 }}
      className={`${
        isInMaintenance
          ? 'bg-gray-500 cursor-not-allowed'
          : 'bg-[#ADFF2F] hover:bg-[#9AE600]'
      } text-[#0D1B2A] font-medium px-4 py-2 rounded-full transition-colors flex items-center relative`}
      aria-label={isInMaintenance ? tMaintenance('title') : t('title')}
      title={isInMaintenance ? tMaintenance('title') : undefined}
    >
      {isInMaintenance ? (
        <Wrench className="w-5 h-5 mr-2" />
      ) : (
        <ShoppingCart className="w-5 h-5 mr-2" />
      )}
      <span className="hidden md:inline">{isInMaintenance ? tMaintenance('title') : t('title')}</span>

      {/* Badge with counter */}
      <AnimatePresence>
        {totalItems > 0 && !isInMaintenance && (
          <motion.div
            className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {showPlus ? (
                <motion.div
                  key="plus"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="w-3 h-3" strokeWidth={3} />
                </motion.div>
              ) : (
                <motion.span
                  key={`count-${totalItems}`}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.3 }}
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
