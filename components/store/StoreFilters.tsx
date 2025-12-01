"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface StoreFiltersProps {
  activeFilter: string
  handleFilterChange: (filter: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const StoreFilters = memo(
  ({ activeFilter, handleFilterChange, searchQuery, setSearchQuery }: StoreFiltersProps) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1B263B]/70 backdrop-blur-sm p-4 rounded-lg border border-[#1B263B]/80">
          <div className="flex flex-wrap gap-2">
            <FilterButton label="Todos" isActive={activeFilter === "all"} onClick={() => handleFilterChange("all")} />
            <FilterButton
              label="Pavos"
              isActive={activeFilter === "vbucks"}
              onClick={() => handleFilterChange("vbucks")}
            />
            <FilterButton
              label="Tienda"
              isActive={activeFilter === "store"}
              onClick={() => handleFilterChange("store")}
            />
            <FilterButton
              label="Fortnite Crew"
              isActive={activeFilter === "crew"}
              onClick={() => handleFilterChange("crew")}
            />
            <FilterButton
              label="Bundles"
              isActive={activeFilter === "bundle"}
              onClick={() => handleFilterChange("bundle")}
            />
          </div>

          <div className="relative w-full md:w-64">
            <motion.div
              animate={searchQuery ? {
                boxShadow: [
                  "0 0 0px rgba(0, 245, 212, 0)",
                  "0 0 15px rgba(0, 245, 212, 0.5)",
                  "0 0 5px rgba(0, 245, 212, 0.3)",
                  "0 0 15px rgba(0, 245, 212, 0.5)",
                  "0 0 0px rgba(0, 245, 212, 0)",
                ]
              } : { boxShadow: "0 0 0px rgba(0, 245, 212, 0)" }}
              transition={searchQuery ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              } : { duration: 0.3 }}
              className="rounded-full"
            >
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full bg-[#0D1B2A] text-white border rounded-full py-2 pl-10 pr-4 focus:outline-none transition-colors",
                  searchQuery ? "border-[#00F5D4]" : "border-[#1B263B] focus:border-[#00F5D4]"
                )}
                aria-label="Buscar artículos"
              />
            </motion.div>
            <Search className={cn(
              "absolute left-3 top-2.5 w-4 h-4 transition-colors",
              searchQuery ? "text-[#00F5D4]" : "text-gray-400"
            )} />
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
StoreFilters.displayName = "StoreFilters"
