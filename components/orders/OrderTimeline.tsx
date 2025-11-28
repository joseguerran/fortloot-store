"use client"

import { memo } from "react"
import { Package, CreditCard, CheckCircle, Gift, XCircle, Clock } from "lucide-react"

type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "PAID"
  | "VERIFYING_EPIC"
  | "FRIENDSHIP_PENDING"
  | "GIFTING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"

interface TimelineStep {
  key: string
  label: string
  icon: React.ReactNode
  statuses: OrderStatus[]
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: "created",
    label: "Pedido",
    icon: <Package className="w-4 h-4" />,
    statuses: ["PENDING", "PAYMENT_PENDING"],
  },
  {
    key: "paid",
    label: "Pagado",
    icon: <CreditCard className="w-4 h-4" />,
    statuses: ["PAID"],
  },
  {
    key: "verified",
    label: "Verificado",
    icon: <CheckCircle className="w-4 h-4" />,
    statuses: ["VERIFYING_EPIC", "FRIENDSHIP_PENDING"],
  },
  {
    key: "gifting",
    label: "Enviando",
    icon: <Gift className="w-4 h-4" />,
    statuses: ["GIFTING"],
  },
  {
    key: "completed",
    label: "Completado",
    icon: <CheckCircle className="w-4 h-4" />,
    statuses: ["COMPLETED"],
  },
]

const SPECIAL_STATES: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  CANCELLED: {
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    icon: <XCircle className="w-5 h-5" />,
    label: "Cancelado",
  },
  FAILED: {
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    icon: <XCircle className="w-5 h-5" />,
    label: "Fallido",
  },
}

interface OrderTimelineProps {
  status: OrderStatus
  compact?: boolean
}

function getStepIndex(status: OrderStatus): number {
  for (let i = 0; i < TIMELINE_STEPS.length; i++) {
    if (TIMELINE_STEPS[i].statuses.includes(status)) {
      return i
    }
  }
  return -1
}

export const OrderTimeline = memo(({ status, compact = false }: OrderTimelineProps) => {
  // Check if it's a special state (cancelled/failed)
  if (SPECIAL_STATES[status]) {
    const special = SPECIAL_STATES[status]
    return (
      <div className={`flex items-center gap-2 ${special.color}`}>
        <div className={`p-2 rounded-full ${special.bgColor}`}>{special.icon}</div>
        <span className="font-medium">{special.label}</span>
      </div>
    )
  }

  const currentStepIndex = getStepIndex(status)
  const isPending = status === "PENDING" || status === "PAYMENT_PENDING"

  if (compact) {
    // Vertical compact timeline
    return (
      <div className="flex flex-col gap-0">
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex || (index === currentStepIndex && status === "COMPLETED")
          const isCurrent = index === currentStepIndex && status !== "COMPLETED"
          const isLast = index === TIMELINE_STEPS.length - 1

          return (
            <div key={step.key} className="flex items-start gap-2">
              {/* Circle and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? "bg-[#00F5D4]"
                      : isCurrent
                        ? isPending
                          ? "bg-yellow-400 animate-pulse"
                          : "bg-[#FF007A] animate-pulse"
                        : "bg-gray-600"
                  }`}
                >
                  {isCompleted && <CheckCircle className="w-2.5 h-2.5 text-[#0D1B2A]" />}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-3 ${
                      isCompleted ? "bg-[#00F5D4]" : "bg-gray-600"
                    }`}
                  />
                )}
              </div>
              {/* Label */}
              <span
                className={`text-[11px] leading-4 font-medium ${
                  isCompleted
                    ? "text-[#00F5D4]"
                    : isCurrent
                      ? isPending
                        ? "text-yellow-400"
                        : "text-[#FF007A]"
                      : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = index < currentStepIndex || (index === currentStepIndex && status === "COMPLETED")
        const isCurrent = index === currentStepIndex && status !== "COMPLETED"

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-[#00F5D4] text-[#0D1B2A]"
                    : isCurrent
                      ? isPending
                        ? "bg-yellow-400/20 text-yellow-400 ring-2 ring-yellow-400 animate-pulse"
                        : "bg-[#FF007A]/20 text-[#FF007A] ring-2 ring-[#FF007A] animate-pulse"
                      : "bg-gray-700 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isCurrent && isPending ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  isCompleted
                    ? "text-[#00F5D4]"
                    : isCurrent
                      ? isPending
                        ? "text-yellow-400"
                        : "text-[#FF007A]"
                      : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < TIMELINE_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  isCompleted ? "bg-[#00F5D4]" : "bg-gray-700"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
})

OrderTimeline.displayName = "OrderTimeline"

// Export helper to get status label
export function getStatusLabel(status: OrderStatus): string {
  if (SPECIAL_STATES[status]) {
    return SPECIAL_STATES[status].label
  }

  const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Pendiente de pago",
    PAYMENT_PENDING: "Esperando pago",
    PAID: "Pago recibido",
    VERIFYING_EPIC: "Verificando cuenta",
    FRIENDSHIP_PENDING: "Esperando amistad",
    GIFTING: "Enviando regalo",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
    FAILED: "Fallido",
  }

  return statusLabels[status] || status
}
