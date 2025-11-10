"use client"

import { useState, useEffect, memo } from "react"
import type { TimeRemaining } from "@/types"

export const CountdownTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const targetTime = new Date(now)
      targetTime.setHours(21, 0, 0, 0) // 9:00 PM

      if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1)
      }

      const diff = targetTime.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ hours, minutes, seconds })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-12 text-center">
      <div className="bg-[#1B263B]/70 backdrop-blur-sm rounded-lg p-6 inline-block border border-[#1B263B]/80">
        <h3 className="text-lg font-medium text-gray-300 mb-2">Próxima actualización de la tienda en:</h3>
        <div className="flex justify-center gap-4">
          <TimeUnit value={timeRemaining.hours} label="Horas" />
          <TimeUnit value={timeRemaining.minutes} label="Minutos" />
          <TimeUnit value={timeRemaining.seconds} label="Segundos" />
        </div>
      </div>
    </div>
  )
}

interface TimeUnitProps {
  value: number
  label: string
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="bg-[#0D1B2A] px-4 py-2 rounded-lg">
      <span className="text-2xl font-bold text-[#00F5D4]">{value.toString().padStart(2, "0")}</span>
      <span className="text-xs text-gray-400 block">{label}</span>
    </div>
  )
}
