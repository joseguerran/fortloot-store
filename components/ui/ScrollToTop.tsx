"use client"

import { useState, useEffect, memo } from "react"
import { motion } from "framer-motion"

export const ScrollToTop = memo(() => {
  const [isVisible, setIsVisible] = useState(false)

  // Mostrar botón cuando se desplaza hacia abajo
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  // Función para desplazarse suavemente hacia arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <motion.button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 p-3 rounded-full bg-secondary text-darker shadow-lg z-50 ${
        isVisible ? "flex" : "hidden"
      } items-center justify-center neon-border-cyan`}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
      transition={{ duration: 0.3 }}
      aria-label="Volver arriba"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </motion.button>
  )
})

ScrollToTop.displayName = "ScrollToTop"
