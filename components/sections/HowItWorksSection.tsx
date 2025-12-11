"use client"

import type React from "react"

import { memo } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, CreditCard, Package } from "lucide-react"
import { AnimatedTitle } from "@/components/ui/AnimatedTitle"
import { useTranslations } from "next-intl"

export const HowItWorksSection = memo(() => {
  const t = useTranslations("home.howItWorks")

  const steps = [
    {
      icon: <ShoppingCart className="w-12 h-12 text-accent" />,
      title: t("step1.title"),
      description: t("step1.description"),
      borderColor: "border-accent",
      neonClass: "neon-border-lime",
    },
    {
      icon: <CreditCard className="w-12 h-12 text-primary" />,
      title: t("step2.title"),
      description: t("step2.description"),
      borderColor: "border-primary",
      neonClass: "neon-border",
    },
    {
      icon: <Package className="w-12 h-12 text-secondary" />,
      title: t("step3.title"),
      description: t("step3.description"),
      borderColor: "border-secondary",
      neonClass: "neon-border-cyan",
    },
  ]

  return (
    <section id="como-funciona" className="min-h-screen py-16 bg-dark flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <AnimatedTitle color="text-primary">{t("title")}</AnimatedTitle>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

interface StepCardProps {
  step: {
    icon: React.ReactNode
    title: string
    description: string
    borderColor: string
    neonClass: string
  }
  index: number
}

const StepCard = memo(({ step, index }: StepCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{
      duration: 0.5,
      delay: index * 0.2,
      type: "spring",
      stiffness: 100,
    }}
    className={`bg-dark p-6 rounded-lg text-center shadow-lg transform transition-all duration-300 ${step.neonClass}`}
  >
    <motion.div
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: 0.3 + index * 0.1,
        type: "spring",
        stiffness: 200,
      }}
      className={`w-20 h-20 rounded-full bg-light flex items-center justify-center mx-auto mb-4 border ${step.borderColor}`}
    >
      {step.icon}
    </motion.div>
    <h3 className="text-xl font-['Russo_One'] text-white mb-3">{step.title}</h3>
    <p className="text-gray-400">{step.description}</p>
  </motion.div>
))

StepCard.displayName = "StepCard"
HowItWorksSection.displayName = "HowItWorksSection"
