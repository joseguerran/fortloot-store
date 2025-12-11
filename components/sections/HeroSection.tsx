"use client"

import { memo } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { IMAGES } from "@/config/images"
import { useTranslations } from "next-intl"

export const HeroSection = memo(() => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5])
  const t = useTranslations("home.hero")

  return (
    <section id="inicio" className="min-h-screen pt-20 relative overflow-hidden flex items-center">
      <motion.div className="absolute inset-0 z-0" style={{ y, opacity }}>
        <OptimizedImage src={IMAGES.NEON_GAMING_NEW} alt="Gaming Background" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </motion.div>

      <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
        <div className="text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-7xl font-['Russo_One'] text-white mb-4">
              <span className="text-white">Fort</span>
              <span className="text-primary neon-text">Loot</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary neon-text-cyan mb-6">
              {t("title")}
            </p>
            <p className="text-lg text-gray-200 mb-8 mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

HeroSection.displayName = "HeroSection"
