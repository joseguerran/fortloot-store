"use client"

import { memo } from "react"
import { Package, CreditCard, CheckCircle, Gift, XCircle, Clock } from "lucide-react"
import { useTranslations } from "next-intl"

type OrderStatus =
  | "PENDING"
  | "PENDING_PAYMENT"
  | "PAYMENT_UPLOADED"
  | "PAYMENT_VERIFIED"
  | "WAITING_FRIENDSHIP"
  | "WAITING_PERIOD"
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
  | "PAYMENT_REJECTED"
  | "EXPIRED"
  | "ABANDONED"
  | "REFUNDED"

interface TimelineStep {
  key: string
  translationKey: string
  icon: React.ReactNode
  statuses: OrderStatus[]
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: "created",
    translationKey: "created",
    icon: <Package className="w-4 h-4" />,
    statuses: ["PENDING", "PENDING_PAYMENT", "PAYMENT_UPLOADED"],
  },
  {
    key: "paid",
    translationKey: "paid",
    icon: <CreditCard className="w-4 h-4" />,
    statuses: ["PAYMENT_VERIFIED"],
  },
  {
    key: "verified",
    translationKey: "verified",
    icon: <CheckCircle className="w-4 h-4" />,
    statuses: ["WAITING_FRIENDSHIP", "WAITING_PERIOD", "QUEUED"],
  },
  {
    key: "gifting",
    translationKey: "gifting",
    icon: <Gift className="w-4 h-4" />,
    statuses: ["PROCESSING"],
  },
  {
    key: "completed",
    translationKey: "completed",
    icon: <CheckCircle className="w-4 h-4" />,
    statuses: ["COMPLETED"],
  },
]

const SPECIAL_STATUS_KEYS: Record<string, { color: string; bgColor: string; icon: React.ReactNode; statusKey: string }> = {
  CANCELLED: { color: "text-red-400", bgColor: "bg-red-500/20", icon: <XCircle className="w-5 h-5" />, statusKey: "cancelled" },
  FAILED: { color: "text-blue-400", bgColor: "bg-blue-500/20", icon: <Package className="w-5 h-5" />, statusKey: "failed" },  // Enmascarado como "Procesando"
  PAYMENT_REJECTED: { color: "text-red-400", bgColor: "bg-red-500/20", icon: <XCircle className="w-5 h-5" />, statusKey: "paymentRejected" },
  EXPIRED: { color: "text-gray-400", bgColor: "bg-gray-500/20", icon: <XCircle className="w-5 h-5" />, statusKey: "expired" },
  ABANDONED: { color: "text-gray-400", bgColor: "bg-gray-500/20", icon: <XCircle className="w-5 h-5" />, statusKey: "abandoned" },
  REFUNDED: { color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: <XCircle className="w-5 h-5" />, statusKey: "refunded" },
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
  const t = useTranslations("orders.myOrders.timeline")
  const tStatus = useTranslations("orders.status")

  // Check if it's a special state (cancelled/failed)
  if (SPECIAL_STATUS_KEYS[status]) {
    const special = SPECIAL_STATUS_KEYS[status]
    return (
      <div className={`flex items-center gap-2 ${special.color}`}>
        <div className={`p-2 rounded-full ${special.bgColor}`}>{special.icon}</div>
        <span className="font-medium">{tStatus(special.statusKey)}</span>
      </div>
    )
  }

  const currentStepIndex = getStepIndex(status)
  const isPending = status === "PENDING" || status === "PENDING_PAYMENT" || status === "PAYMENT_UPLOADED"

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
                {t(step.translationKey)}
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
                {t(step.translationKey)}
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

// Export helper to get status label (used by OrderCard)
// This is a non-hook function for use in non-component contexts
export function getStatusLabel(status: OrderStatus, tStatus: (key: string) => string): string {
  const STATUS_KEYS: Record<OrderStatus, string> = {
    PENDING: "pending",
    PENDING_PAYMENT: "pendingPayment",
    PAYMENT_UPLOADED: "paymentUploaded",
    PAYMENT_VERIFIED: "paymentVerified",
    WAITING_FRIENDSHIP: "waitingFriendship",
    WAITING_PERIOD: "waitingPeriod",
    QUEUED: "queued",
    PROCESSING: "processing",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    FAILED: "failed",
    PAYMENT_REJECTED: "paymentRejected",
    EXPIRED: "expired",
    ABANDONED: "abandoned",
    REFUNDED: "refunded",
  }

  return tStatus(STATUS_KEYS[status] || status.toLowerCase())
}
