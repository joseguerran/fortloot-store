"use client"

import type React from "react"

import { useRef, useEffect, memo } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  id?: string
}

export const AnimatedSection = memo(({ children, className = "", id = "" }: AnimatedSectionProps) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: false, threshold: 0.1 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    } else {
      controls.start("hidden")
    }
  }, [controls, inView])

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            staggerChildren: 0.2,
          },
        },
      }}
      className={`min-h-screen py-16 ${className}`}
    >
      {children}
    </motion.section>
  )
})

AnimatedSection.displayName = "AnimatedSection"
