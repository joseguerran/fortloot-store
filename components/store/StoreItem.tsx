"use client"

import { memo, useMemo } from "react"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { motion } from "framer-motion"
import { ShoppingCart, Coins } from "lucide-react"
import type { StoreItem as StoreItemType } from "@/types"
import { IMAGES } from "@/config/images"
import { useCart } from "@/context/CartContext"

interface StoreItemProps {
  item: StoreItemType
}

export const StoreItem = memo(({ item }: StoreItemProps) => {
  const { addToCart } = useCart()

  // Filtrar: solo mostrar la tarjeta de Crew de 1 mes
  if (item.type === "crew" && item.id !== "crew-2") {
    return null
  }

  const handleAddToCart = () => {
    addToCart(item)
  }

  // Generar SVG de fallback basado en el tipo (memoizado para evitar re-renders)
  const fallbackSVG = useMemo(() => {
    const colors: Record<string, string> = {
      vbucks: "%234F46E5",     // Purple
      crew: "%2306B6D4",       // Cyan
      battle_pass: "%23FFD700", // Gold
      bundle: "%238B5CF6",     // Purple
      outfit: "%23F59E0B",     // Orange
      emote: "%2310B981",      // Green
      pickaxe: "%23EF4444",    // Red
      glider: "%238B5CF6",     // Purple
      backpack: "%23F59E0B",   // Orange
      wrap: "%2310B981",       // Green
    }

    const labels: Record<string, string> = {
      vbucks: "V-Bucks",
      crew: "Crew",
      battle_pass: "Battle Pass",
      bundle: "Bundle",
      outfit: "Outfit",
      emote: "Emote",
      pickaxe: "Pickaxe",
      glider: "Glider",
      backpack: "Backpack",
      wrap: "Wrap",
    }

    const color = colors[item.type] || "%234F46E5"
    const label = labels[item.type] || "Item"

    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="${color}"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="40" fill="white" font-family="Arial"%3E${label}%3C/text%3E%3C/svg%3E`
  }, [item.type])

  // Determinar la imagen correcta basada en el tipo y nombre del item (memoizado)
  const itemImage = useMemo(() => {
    // Si el item tiene una imagen específica, usarla
    if (item.image) {
      return item.image
    }

    // Si no tiene imagen, usar SVG fallback
    return fallbackSVG
  }, [item.image, fallbackSVG])

  // Obtener precios del backend (ya vienen calculados en centavos)
  const finalPrice = item.price?.finalPrice || 0
  const regularPrice = item.price?.regularPrice || 0

  // Convertir de centavos a USD para mostrar
  const displayPrice = `$${(finalPrice / 100).toFixed(2)}`

  // Verificar si el item tiene precio en V-Bucks
  const hasVBucksPrice = item.vbucksPrice && item.vbucksPrice > 0

  // Determinar si es el paquete de 13500 V-Bucks para añadir un badge especial
  const is13500VBucks = item.type === "vbucks" && (item.name || "").toLowerCase().includes("13500")

  // Determinar si es Fortnite Crew 1 mes para añadir un badge especial
  const isCrewMonthly = item.type === "crew" && (item.name || "").toLowerCase().includes("1 mes")

  return (
    <motion.div
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="bg-[#1B263B]/70 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:shadow-[#00F5D4]/30 border border-transparent hover:border-[#00F5D4]/50"
    >
      {/* Imagen */}
      <div className="relative h-64 bg-gradient-to-b from-[#1B263B] to-[#0D1B2A]">
        <OptimizedImage
          src={itemImage}
          alt={item.name || "Fortnite Item"}
          fallbackSrc={fallbackSVG}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />

        {/* Badge */}
        {(item.badge || is13500VBucks || isCrewMonthly) && (
          <div className="absolute top-2 right-2 bg-[#FF007A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3 z-10">
            {is13500VBucks ? "MEJOR VALOR" : isCrewMonthly ? "EXCLUSIVO" : item.badge}
          </div>
        )}
      </div>

      {/* Detalles */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{item.name || "Artículo sin nombre"}</h3>
        <p className="text-sm text-gray-300 mb-4 line-clamp-2">{item.description || "Sin descripción disponible"}</p>

        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {/* Precio en USD (destacado) */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#ADFF2F] text-lg">{displayPrice}</span>
              {regularPrice && finalPrice && regularPrice > finalPrice && (
                <span className="text-gray-400 text-sm line-through">
                  ${(regularPrice / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* Precio en V-Bucks (secundario) */}
            {hasVBucksPrice && (
              <div className="flex items-center text-xs text-gray-300 mt-1">
                <Coins className="w-3 h-3 mr-0.5" />
                <span>{item.vbucksPrice} V-Bucks</span>
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-[#FF007A] hover:bg-[#00F5D4] text-white text-sm font-medium px-4 py-2 rounded-full transition-colors duration-300 flex items-center neon-border-cyan"
            aria-label={`Adquirir ${item.name}`}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Adquirir
          </button>
        </div>
      </div>
    </motion.div>
  )
})

StoreItem.displayName = "StoreItem"
