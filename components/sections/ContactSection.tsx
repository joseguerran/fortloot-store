import type React from "react"

import { memo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { PhoneIcon as WhatsApp, Instagram, Facebook } from "lucide-react"
import { AnimatedTitle } from "@/components/ui/AnimatedTitle"
import { IMAGES } from "@/config/images"

const glowCyan = "0 0 15px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.5), 0 0 45px rgba(0, 255, 255, 0.3)"

const socialLinks = [
  {
    icon: <WhatsApp className="w-6 h-6" />,
    name: "WhatsApp",
    color: "bg-green-500",
    neon: "neon-border-cyan",
    hoverColor: "#10B981",
    glowColor: glowCyan,
    href: "https://wa.me/+5491169755444/?text=Hola, me gustaría obtener más información.",
  },
  {
    icon: <Facebook className="w-6 h-6" />,
    name: "Facebook",
    color: "bg-blue-600",
    neon: "neon-border-cyan",
    hoverColor: "#2563EB",
    glowColor: glowCyan,
  },
  {
    icon: <Instagram className="w-6 h-6" />,
    name: "Instagram",
    color: "bg-primary",
    neon: "neon-border-cyan",
    hoverColor: "#FF3E9A",
    glowColor: glowCyan,
    href: "https://www.instagram.com/fortlootlatam?igsh=bnE1dDZqbWExN3d6&utm_source=qr",
  },
  {
    icon: (
      <div className="relative w-6 h-6 flex items-center justify-center">
        <Image
          src={IMAGES.TIKTOK_LOGO || "/placeholder.svg"}
          alt="TikTok logo"
          width={24}
          height={24}
          className="object-contain"
        />
      </div>
    ),
    name: "TikTok",
    color: "bg-black",
    neon: "neon-border-cyan",
    noColorChange: true,
    glowColor: glowCyan,
    href: "https://www.tiktok.com/@fortlootlatam?_r=1&_t=ZM-91raPSuSrOq",
  },
]

export const ContactSection = memo(() => {
  return (
    <section id="contacto" className="min-h-screen py-16 bg-dark text-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <AnimatedTitle color="text-secondary">Contacto</AnimatedTitle>

        <div className="max-w-3xl mx-auto text-center mt-12">
          <h3 className="text-2xl font-['Russo_One'] mb-6 text-white">¿Tienes Preguntas?</h3>
          <p className="text-gray-300 mb-8">
            Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda o problema que puedas tener.
            Contáctanos a través de cualquiera de nuestros canales de comunicación.
          </p>

          <div className="flex justify-center gap-12 mb-12">
            {socialLinks.map((social, index) => (
              <SocialLink key={index} social={social} index={index} />
            ))}
          </div>

          <div className="flex justify-center items-center mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-secondary mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-300">
              <span className="font-bold">Email:</span> fortlootlatam@gmail.com
            </p>
          </div>
        </div>
      </div>
    </section>
  )
})

interface SocialLinkProps {
  social: {
    icon: React.ReactNode
    name: string
    color: string
    neon: string
    hoverColor: string
    glowColor: string
    noColorChange?: boolean
    href?: string
  }
  index: number
}

const SocialLink = memo(({ social, index }: SocialLinkProps) => (
  <motion.a
    href={social.href || "#"}
    target={social.href ? "_blank" : undefined}
    rel={social.href ? "noopener noreferrer" : undefined}
    initial={{ scale: 0 }}
    whileInView={{ scale: 1 }}
    viewport={{ once: true }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 15,
      delay: index * 0.08,
    }}
    whileHover={{
      scale: 1.15,
      backgroundColor: social.noColorChange ? undefined : social.hoverColor,
      color: social.noColorChange ? undefined : "#0B0F2E",
      boxShadow: social.glowColor,
      transition: { duration: 0.15 },
    }}
    className={`w-14 h-14 rounded-full ${social.color} flex items-center justify-center transition-all duration-150 ${social.neon} shadow-lg`}
    aria-label={`Contactar por ${social.name}`}
  >
    {social.icon}
  </motion.a>
))

SocialLink.displayName = "SocialLink"
ContactSection.displayName = "ContactSection"
