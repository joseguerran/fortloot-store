"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle } from "lucide-react"

interface PaymentCountdownTimerProps {
  expiresAt: string | Date
  onExpire?: () => void
}

export function PaymentCountdownTimer({ expiresAt, onExpire }: PaymentCountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState({
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  })

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date()
      const target = new Date(expiresAt)
      const diff = target.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining({ minutes: 0, seconds: 0, totalSeconds: 0 })
        if (onExpire) {
          onExpire()
        }
        return
      }

      const totalSeconds = Math.floor(diff / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      setTimeRemaining({ minutes, seconds, totalSeconds })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  // Determine color based on time remaining
  const getColorClasses = () => {
    const { totalSeconds } = timeRemaining

    if (totalSeconds === 0) {
      return {
        bg: "bg-red-500/20",
        border: "border-red-500",
        text: "text-red-500",
        numberBg: "bg-red-500/10",
      }
    } else if (totalSeconds < 120) { // Less than 2 minutes
      return {
        bg: "bg-red-500/10",
        border: "border-red-500",
        text: "text-red-500",
        numberBg: "bg-red-500/10",
      }
    } else if (totalSeconds < 300) { // Less than 5 minutes
      return {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500",
        text: "text-yellow-500",
        numberBg: "bg-yellow-500/10",
      }
    } else {
      return {
        bg: "bg-primary/10",
        border: "border-primary",
        text: "text-primary",
        numberBg: "bg-darker",
      }
    }
  }

  const colors = getColorClasses()
  const { minutes, seconds, totalSeconds } = timeRemaining

  // Show warning message based on time
  const getWarningMessage = () => {
    if (totalSeconds === 0) {
      return "⏱️ El tiempo ha expirado. Esta orden ha sido marcada como abandonada."
    } else if (totalSeconds < 120) {
      return "⚠️ ¡URGENTE! Quedan menos de 2 minutos. Sube tu comprobante ahora o la orden será abandonada."
    } else if (totalSeconds < 300) {
      return "⏰ Quedan menos de 5 minutos. Por favor sube tu comprobante pronto."
    }
    return null
  }

  const warningMessage = getWarningMessage()

  return (
    <div className={`rounded-lg p-4 border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-3 mb-3">
        {totalSeconds < 120 ? (
          <AlertTriangle className={`w-5 h-5 ${colors.text} animate-pulse`} />
        ) : (
          <Clock className={`w-5 h-5 ${colors.text}`} />
        )}
        <h3 className={`text-sm font-medium ${colors.text}`}>
          Tiempo para subir comprobante
        </h3>
      </div>

      <div className="flex justify-center gap-2 mb-3">
        <div className={`${colors.numberBg} px-4 py-2 rounded-lg border ${colors.border}`}>
          <span className={`text-3xl font-bold ${colors.text}`}>
            {minutes.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-gray-400 block">Minutos</span>
        </div>
        <div className={`${colors.numberBg} px-4 py-2 rounded-lg border ${colors.border}`}>
          <span className={`text-3xl font-bold ${colors.text}`}>
            {seconds.toString().padStart(2, "0")}
          </span>
          <span className="text-xs text-gray-400 block">Segundos</span>
        </div>
      </div>

      {warningMessage && (
        <div className={`text-sm ${colors.text} text-center font-medium ${totalSeconds < 120 ? 'animate-pulse' : ''}`}>
          {warningMessage}
        </div>
      )}
    </div>
  )
}
