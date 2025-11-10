"use client"

import { useState, useEffect } from "react"
import type { TimeRemaining } from "@/types"

export const useTimeRemaining = (): TimeRemaining => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Obtener la fecha y hora actual
      const now = new Date()

      // Crear la fecha objetivo para hoy a las 9:00 PM
      const targetTime = new Date(now)
      targetTime.setHours(21, 0, 0, 0) // 9:00 PM

      // Si ya pasó la hora objetivo de hoy, establecer para mañana
      if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1)
      }

      // Calcular la diferencia en milisegundos
      const diff = targetTime.getTime() - now.getTime()

      // Convertir a horas, minutos y segundos
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ hours, minutes, seconds })
    }

    // Calcular inmediatamente
    calculateTimeRemaining()

    // Actualizar cada segundo
    const interval = setInterval(calculateTimeRemaining, 1000)

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval)
  }, [])

  return timeRemaining
}
