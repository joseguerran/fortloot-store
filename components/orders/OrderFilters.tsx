"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"

export type OrderStatusFilter = "all" | "pending" | "processing" | "completed" | "cancelled"
export type DateRangeFilter = "30d" | "3m" | "1y" | "all"

interface OrderFiltersProps {
  activeStatus: OrderStatusFilter
  onStatusChange: (status: OrderStatusFilter) => void
  dateRange: DateRangeFilter
  onDateRangeChange: (range: DateRangeFilter) => void
}

const STATUS_FILTERS: { key: OrderStatusFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "processing", label: "En Proceso" },
  { key: "completed", label: "Completadas" },
  { key: "cancelled", label: "Canceladas" },
]

const DATE_RANGES: { key: DateRangeFilter; label: string }[] = [
  { key: "30d", label: "Últimos 30 días" },
  { key: "3m", label: "Últimos 3 meses" },
  { key: "1y", label: "Último año" },
  { key: "all", label: "Todas las fechas" },
]

export const OrderFilters = memo(
  ({ activeStatus, onStatusChange, dateRange, onDateRangeChange }: OrderFiltersProps) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1B263B]/70 backdrop-blur-sm p-4 rounded-lg border border-[#1B263B]/80">
          {/* Status filters */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <FilterButton
                key={filter.key}
                label={filter.label}
                isActive={activeStatus === filter.key}
                onClick={() => onStatusChange(filter.key)}
              />
            ))}
          </div>

          {/* Date range dropdown */}
          <div className="relative w-full md:w-auto">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRangeFilter)}
              className="appearance-none w-full md:w-48 bg-[#0D1B2A] text-white border border-[#1B263B] rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-[#00F5D4] transition-colors cursor-pointer"
              aria-label="Filtrar por fecha"
            >
              {DATE_RANGES.map((range) => (
                <option key={range.key} value={range.key}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>
    )
  },
)

interface FilterButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

const FilterButton = memo(({ label, isActive, onClick }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      isActive
        ? "bg-[#FF007A] text-white shadow-lg shadow-[#FF007A]/20"
        : "bg-[#0D1B2A] text-gray-300 hover:bg-[#00F5D4]/20"
    }`}
    aria-pressed={isActive}
  >
    {label}
  </button>
))

FilterButton.displayName = "FilterButton"
OrderFilters.displayName = "OrderFilters"

// Helper function to filter orders by status
export function filterOrdersByStatus(orders: any[], status: OrderStatusFilter): any[] {
  if (status === "all") return orders

  const statusMap: Record<OrderStatusFilter, string[]> = {
    all: [],
    pending: ["PENDING", "PAYMENT_PENDING"],
    processing: ["PAID", "VERIFYING_EPIC", "FRIENDSHIP_PENDING", "GIFTING"],
    completed: ["COMPLETED"],
    cancelled: ["CANCELLED", "FAILED"],
  }

  return orders.filter((order) => statusMap[status].includes(order.status))
}

// Helper function to filter orders by date range
export function filterOrdersByDate(orders: any[], range: DateRangeFilter): any[] {
  if (range === "all") return orders

  const now = new Date()
  const rangeMap: Record<DateRangeFilter, number> = {
    "30d": 30,
    "3m": 90,
    "1y": 365,
    all: 0,
  }

  const daysAgo = rangeMap[range]
  const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

  return orders.filter((order) => new Date(order.createdAt) >= cutoffDate)
}
