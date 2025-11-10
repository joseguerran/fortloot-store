"use client"

import type React from "react"

import { memo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ShoppingCart, Sparkles, Users, Gift, Gamepad2 } from "lucide-react"
import { AnimatedTitle } from "@/components/ui/AnimatedTitle"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

const services = [
  {
    name: "PAVOS",
    icon: <Sparkles className="w-8 h-8 text-accent" />,
    description: "Moneda virtual para comprar artículos en la tienda de Fortnite",
    image: "/vbucks-stack.png",
    bgColor: "from-dark to-light",
    borderColor: "border-accent",
    buttonColor: "bg-accent",
    textColor: "text-darker",
    neonClass: "neon-border-lime",
    link: "/tienda?filter=vbucks",
  },
  {
    name: "TIENDA",
    icon: <Gamepad2 className="w-8 h-8 text-primary" />,
    description: "Personaliza tu personaje con los mejores diseños y atuendos",
    image: "/fortnite-skins-band.jpeg",
    bgColor: "from-dark to-light",
    borderColor: "border-primary",
    buttonColor: "bg-primary",
    textColor: "text-darker",
    neonClass: "neon-border",
    link: "/tienda?filter=store",
  },
  {
    name: "FORTNITE CREW",
    icon: <Users className="w-8 h-8 text-secondary" />,
    description: "Suscripción mensual con beneficios exclusivos y contenido premium",
    image: "/fortnite-crew-new.png",
    bgColor: "from-dark to-light",
    borderColor: "border-secondary",
    buttonColor: "bg-secondary",
    textColor: "text-darker",
    neonClass: "neon-border-cyan",
    link: "/tienda?filter=crew",
  },
  {
    name: "LOTES",
    icon: <Gift className="w-8 h-8 text-white" />,
    description: "Combos especiales con múltiples items a precios reducidos",
    image: "/skins-actualizacion-930-fortnite.webp",
    bgColor: "from-dark to-light",
    borderColor: "border-white",
    buttonColor: "bg-white",
    textColor: "text-darker",
    neonClass: "border-2 border-white shadow-[0_0_5px_rgba(255,255,255,0.7),0_0_10px_rgba(255,255,255,0.5)]",
    link: "/tienda?filter=bundle",
  },
]

export const ProductsSection = memo(() => {
  return (
    <section id="productos" className="min-h-screen py-16 bg-darker flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedTitle color="text-secondary">Nuestros Servicios</AnimatedTitle>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl text-center text-gray-300 max-w-2xl mx-auto mt-6"
          >
            Ofrecemos los mejores servicios para mejorar tu experiencia en Fortnite
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
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
}

const ServiceCard = memo(({ service, index }: ServiceCardProps) => (
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
          <span className="text-white text-opacity-80 text-sm">Entrega inmediata</span>
          <Link
            href={service.link}
            className={`${service.buttonColor} ${service.textColor} font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300 flex items-center ${service.neonClass}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar
          </Link>
        </div>
      </div>
    </div>
  </motion.div>
))

ServiceCard.displayName = "ServiceCard"
ProductsSection.displayName = "ProductsSection"
