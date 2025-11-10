"use client"

import type React from "react"

import { memo } from "react"
import { motion } from "framer-motion"

interface AnimatedTitleProps {
  children: React.ReactNode
  color?: string
  delay?: number
}

export const AnimatedTitle = memo(({ children, color = "text-primary", delay = 0 }: AnimatedTitleProps) => {
  return (
    <div className="relative mb-12">
      <motion.h2
        className={`text-4xl md:text-5xl font-['Russo_One'] ${color} text-center ${
          color === "text-primary" ? "neon-text" : color === "text-secondary" ? "neon-text-cyan" : "neon-text-lime"
        }`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              delay: delay,
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {children}
      </motion.h2>
      <motion.div
        className={`h-1 w-0 ${
          color === "text-primary" ? "bg-primary" : color === "text-secondary" ? "bg-secondary" : "bg-accent"
        } mx-auto mt-2`}
        initial={{ width: 0 }}
        animate={{ width: "100px", transition: { duration: 0.8, delay: delay + 0.6 } }}
      />
    </div>
  )
})

AnimatedTitle.displayName = "AnimatedTitle"
