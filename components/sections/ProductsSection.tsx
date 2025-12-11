"use client"

import type React from "react"

import { memo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingCart, Sparkles, Users, Gift, Gamepad2 } from "lucide-react"
import { AnimatedTitle } from "@/components/ui/AnimatedTitle"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

const serviceConfigs = [
  {
    key: "vbucks",
    icon: <Sparkles className="w-8 h-8 text-accent" />,
    image: "/vbucks-stack.png",
    bgColor: "from-dark to-light",
    borderColor: "border-accent",
    buttonColor: "bg-accent",
    textColor: "text-darker",
    neonClass: "neon-border-lime",
    filter: "vbucks",
  },
  {
    key: "store",
    icon: <Gamepad2 className="w-8 h-8 text-primary" />,
    image: "/fortnite-skins-band.jpeg",
    bgColor: "from-dark to-light",
    borderColor: "border-primary",
    buttonColor: "bg-primary",
    textColor: "text-darker",
    neonClass: "neon-border",
    filter: "store",
  },
  {
    key: "crew",
    icon: <Users className="w-8 h-8 text-secondary" />,
    image: "/fortnite-crew-new.png",
    bgColor: "from-dark to-light",
    borderColor: "border-secondary",
    buttonColor: "bg-secondary",
    textColor: "text-darker",
    neonClass: "neon-border-cyan",
    filter: "crew",
  },
  {
    key: "bundles",
    icon: <Gift className="w-8 h-8 text-white" />,
    image: "/skins-actualizacion-930-fortnite.webp",
    bgColor: "from-dark to-light",
    borderColor: "border-white",
    buttonColor: "bg-white",
    textColor: "text-darker",
    neonClass: "border-2 border-white shadow-[0_0_5px_rgba(255,255,255,0.7),0_0_10px_rgba(255,255,255,0.5)]",
    filter: "bundle",
  },
]

export const ProductsSection = memo(() => {
  const t = useTranslations("home.products")
  const tCommon = useTranslations("common.buttons")
  const locale = useLocale()

  return (
    <section id="productos" className="min-h-screen py-16 bg-darker flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedTitle color="text-secondary">{t("title")}</AnimatedTitle>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl text-center text-gray-300 max-w-2xl mx-auto mt-6"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceConfigs.map((config, index) => (
              <ServiceCard
                key={index}
                service={{
                  ...config,
                  name: t(`${config.key}.title`),
                  description: t(`${config.key}.description`),
                  link: `/${locale}/store?filter=${config.filter}`,
                }}
                index={index}
                buyLabel={tCommon("buy")}
                deliveryLabel={t("immediateDelivery")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

interface ServiceCardProps {
  service: {
    name: string
    icon: React.ReactNode
    description: string
    image: string
    bgColor: string
    borderColor: string
    buttonColor: string
    textColor: string
    neonClass: string
    link: string
  }
  index: number
  buyLabel: string
  deliveryLabel: string
}

const ServiceCard = memo(({ service, index, buyLabel, deliveryLabel }: ServiceCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{
      scale: 1.03,
      transition: { duration: 0.2 },
    }}
    className="group cursor-pointer"
  >
    <div
      className={`bg-gradient-to-br ${service.bgColor} rounded-xl overflow-hidden shadow-lg h-full border-2 ${service.borderColor} relative ${service.neonClass}`}
    >
      <div className="absolute inset-0 opacity-20">
        <OptimizedImage
          src={service.image}
          alt={service.name}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={90}
        />
      </div>

      <div className="p-6 flex flex-col h-full relative z-10 w-full">
        <div className="flex items-center mb-4">
          <div className={`bg-darker p-3 rounded-full mr-4 border ${service.borderColor}`}>{service.icon}</div>
          <h3 className="font-['Russo_One'] text-white text-2xl">{service.name}</h3>
        </div>

        <p className="text-white text-opacity-90 mb-6">{service.description}</p>

        <div className="mt-auto flex justify-between items-center">
          <span className="text-white text-opacity-80 text-sm">{deliveryLabel}</span>
          <Link
            href={service.link}
            className={`${service.buttonColor} ${service.textColor} font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 flex items-center ${service.neonClass}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {buyLabel}
          </Link>
        </div>
      </div>
    </div>
  </motion.div>
))

ServiceCard.displayName = "ServiceCard"
ProductsSection.displayName = "ProductsSection"
