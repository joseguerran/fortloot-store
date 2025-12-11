"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { Shield } from "lucide-react"
import { AnimatedTitle } from "@/components/ui/AnimatedTitle"
import { useTranslations } from "next-intl"

const paymentMethods = [
  { name: "PayPal", image: "/paypal-logo.png" },
  { name: "Cryptomus", image: "/cryptomus-logo.png" },
  { name: "Binance", image: "/binance-logo-new.png" },
  { name: "Pagomovil", image: "/pagomovil-logo.png" },
]

export const PaymentMethodsSection = memo(() => {
  const t = useTranslations("home.paymentMethods")

  return (
    <section id="metodos-de-pago" className="min-h-screen py-16 bg-darker text-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <AnimatedTitle color="text-accent">{t("title")}</AnimatedTitle>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xl text-center text-gray-300 max-w-2xl mx-auto mb-12"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden">
          <div className="flex justify-center flex-wrap gap-8 mt-8 pb-4">
            {paymentMethods.map((method, index) => (
              <PaymentMethodCard key={index} method={method} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center mt-16 bg-light p-6 rounded-lg max-w-3xl mx-auto neon-border border-b-2 border-primary"
          >
            <Shield className="w-12 h-12 text-primary mr-4 flex-shrink-0" />
            <p className="text-lg">
              {t("securityNote")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
})

interface PaymentMethodCardProps {
  method: {
    name: string
    image: string
  }
  index: number
}

const PaymentMethodCard = memo(({ method, index }: PaymentMethodCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    whileHover={{
      y: -5,
      boxShadow: "0 0 15px rgba(0, 255, 255, 0.5)",
      transition: { duration: 0.2 },
    }}
    className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 neon-border-cyan flex items-center justify-center"
  >
    <div className="h-20 w-40 relative flex items-center justify-center">
      <OptimizedImage
        src={method.image}
        alt={`${method.name} logo`}
        width={140}
        height={80}
        className="object-contain max-h-full max-w-full"
      />
    </div>
  </motion.div>
))

PaymentMethodCard.displayName = "PaymentMethodCard"
PaymentMethodsSection.displayName = "PaymentMethodsSection"
