"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Calendar } from "lucide-react"
import { OrderTimeline, getStatusLabel } from "./OrderTimeline"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

interface OrderItem {
  id: string
  quantity: number
  priceAtPurchase: number
  catalogItem: {
    id: string
    name: string
    image: string
    type: string
    rarity: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  completedAt?: string
  items: OrderItem[]
}

interface OrderCardProps {
  order: Order
  index?: number
}

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    legendary: "from-orange-500/20 to-yellow-500/20 border-orange-500/30",
    epic: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    rare: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    uncommon: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    common: "from-gray-500/20 to-gray-400/20 border-gray-500/30",
  }
  return colors[rarity?.toLowerCase()] || colors.common
}

export const OrderCard = memo(({ order, index = 0 }: OrderCardProps) => {
  const t = useTranslations("orders.myOrders.card")
  const tStatus = useTranslations("orders.status")
  const locale = useLocale()

  const mainItem = order.items[0]
  const additionalItemsCount = order.items.length - 1
  const isPending = order.status === "PENDING" || order.status === "PAYMENT_PENDING"
  const isSpecialStatus = order.status === "CANCELLED" || order.status === "FAILED"

  // Format date using locale
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/${locale}/order-status/${order.id}?from=mis-compras`}>
        <div className="group bg-[#1B263B]/70 backdrop-blur-sm rounded-xl border border-[#1B263B]/80 hover:border-[#FF007A]/50 transition-all duration-300 overflow-hidden">
          <div className="p-4 md:p-5">
            {/* Main layout: Image | Info | Status */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Left: Large image */}
              <div className={`relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${getRarityColor(mainItem?.catalogItem?.rarity || "common")} border`}>
                {mainItem?.catalogItem?.image ? (
                  <Image
                    src={mainItem.catalogItem.image}
                    alt={mainItem.catalogItem.name || "Item"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <span className="text-3xl">🎮</span>
                  </div>
                )}
                {additionalItemsCount > 0 && (
                  <div className="absolute bottom-1.5 right-1.5 bg-[#FF007A] text-white text-xs font-bold px-2 py-0.5 rounded">
                    +{additionalItemsCount}
                  </div>
                )}
              </div>

              {/* Center: Order info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-lg truncate group-hover:text-[#FF007A] transition-colors">
                  {mainItem?.catalogItem?.name || "Orden"}
                  {additionalItemsCount > 0 && (
                    <span className="text-gray-400 font-normal text-sm ml-2">
                      {t("andMore", { count: additionalItemsCount })}
                    </span>
                  )}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <span className="font-mono text-xs">#{order.orderNumber}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                {/* Price */}
                <div className="mt-2">
                  <span className="text-xs text-gray-500">{t("total")}:</span>
                  <span className="text-lg font-bold text-[#00F5D4] ml-2">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Right: Timeline + Action */}
              <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                {/* Vertical timeline */}
                {!isSpecialStatus ? (
                  <OrderTimeline status={order.status as any} compact />
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "CANCELLED" || order.status === "FAILED"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}>
                    {getStatusLabel(order.status as any, tStatus)}
                  </span>
                )}

                {/* Arrow */}
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#FF007A] group-hover:translate-x-1 transition-all" />
              </div>

              {/* Mobile: just arrow */}
              <div className="md:hidden flex-shrink-0">
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#FF007A] group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Mobile: Timeline below (only if not special status) */}
            {!isSpecialStatus && (
              <div className="md:hidden mt-3 pt-3 border-t border-[#1B263B]/50">
                <OrderTimeline status={order.status as any} compact />
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

OrderCard.displayName = "OrderCard"
