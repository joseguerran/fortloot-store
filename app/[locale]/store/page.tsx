"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Info } from "lucide-react"

// Importar componentes
import Pagination from "./components/pagination"
import { StoreItem } from "@/components/store/StoreItem"
import { StoreFilters } from "@/components/store/StoreFilters"
import { CountdownTimer } from "@/components/store/CountdownTimer"
import { EmptyState } from "@/components/store/EmptyState"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

// Importar hooks
// (useTimeRemaining ahora se maneja internamente en CountdownTimer)
import { usePromotions } from "@/context/AnnouncementContext"

// Importar tipos
import type { StoreItem as StoreItemType } from "@/types"

// Importar la función de ordenación y configuración de imágenes
import { sortItemsByPriority } from "@/utils/sortItems"
import { IMAGES } from "@/config/images"
import { logger } from "@/utils/logger"
import { trackViewItemList, trackFilterApplied, trackSearch } from "@/lib/analytics"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

// Constantes
const ITEMS_PER_PAGE = 20

export default function StorePage() {
  const t = useTranslations("store.page")
  const locale = useLocale()

  // Estados
  const [items, setItems] = useState<StoreItemType[]>([])
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState<boolean>(false)
  const [debugMode, setDebugMode] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [isClient, setIsClient] = useState<boolean>(false)
  // Añadir un nuevo estado para almacenar los elementos originales sin filtrar
  const [originalItems, setOriginalItems] = useState<StoreItemType[]>([])

  // Get promotions to determine if we should hide the title header
  const { promotions, isLoading: isLoadingPromotions } = usePromotions()
  const hasPromotions = promotions.length > 0

  // Use Next.js searchParams hook to react to URL changes (client-side navigation)
  const searchParams = useSearchParams()
  const urlFilter = searchParams.get("filter")
  const urlSearch = searchParams.get("search")
  const urlDebug = searchParams.get("debug")

  // Track if initial load has completed to avoid double-setting
  const initialLoadRef = useRef(false)

  // Inicializar el estado del cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // React to URL parameter changes (works for both initial load and client-side navigation)
  useEffect(() => {
    if (!isClient) return

    // Set filter from URL
    if (urlFilter && urlFilter !== activeFilter) {
      logger.log(`🔄 URL filter parameter changed: "${urlFilter}", updating active filter`)
      setActiveFilter(urlFilter)
    } else if (!urlFilter && activeFilter !== "all" && !initialLoadRef.current) {
      // Only reset to "all" on initial load if no filter in URL
      // Don't reset if user manually changed filter (which updates URL)
    }

    // Set search from URL (only on initial load or when URL param is set)
    if (urlSearch !== null && urlSearch !== searchQuery) {
      logger.log(`🔍 URL search parameter changed: "${urlSearch}", updating search query`)
      setSearchQuery(urlSearch)
    }
    // Note: Removed the else branch that cleared searchQuery when urlSearch was null
    // This was causing a bug where typing in the search field would immediately clear

    // Set debug mode
    if (urlDebug === "true" && !debugMode) {
      setDebugMode(true)
    }

    initialLoadRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, urlFilter, urlSearch, urlDebug, activeFilter, debugMode])
  // Note: searchQuery removed from dependencies to prevent clearing user input

  // Actualizar la URL cuando cambia el filtro activo
  const handleFilterChange = useCallback(
    (filter: string) => {
      setActiveFilter(filter)

      // Actualizar la URL con el nuevo filtro
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        if (filter === "all") {
          url.searchParams.delete("filter")
        } else {
          url.searchParams.set("filter", filter)
        }

        // Usar pushState para actualizar la URL sin recargar la página
        window.history.pushState({}, "", url.toString())
      }

      // Track filter applied
      if (filter !== "all") {
        trackFilterApplied("category", filter)
      }

      // Resetear a la primera página
      setCurrentPage(1)
    },
    [],
  )

  // Cargar datos de la API
  // Usar useCallback para evitar advertencias de dependencias
  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    setUsingFallback(false)

    try {
      // Construir la URL con el filtro si existe
      let url = "/api/catalog"
      if (activeFilter !== "all") {
        url += `?filter=${activeFilter}`
      }

      logger.log(`🔍 Fetching items with filter: "${activeFilter}" from URL: ${url}`)

      const response = await fetch(url, {
        // Añadir opciones para evitar problemas de caché
        cache: "no-store",
        next: { revalidate: 0 },
      })

      if (!response.ok) {
        throw new Error(`Error al cargar los datos: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      logger.log(`📦 Received ${data.items?.length || 0} items from API with filter: "${activeFilter}"`)

      // Verificar si estamos usando datos de respaldo
      if (data.usingFallback) {
        setUsingFallback(true)
        if (data.error) {
          setError(data.error)
        }
      }

      // Procesar los datos recibidos
      if (data.items && Array.isArray(data.items)) {
        if (data.items.length > 0) {
          logger.log(`✅ Processing ${data.items.length} items for filter: "${activeFilter}"`)

          // Ordenar los items si el filtro es "all"
          const processedItems = activeFilter === "all" ? sortItemsByPriority(data.items) : data.items

          setItems(processedItems)
          setOriginalItems(processedItems) // Guardar los elementos originales
          // Resetear a la primera página cuando cambian los ítems
          setCurrentPage(1)

          // Track view item list
          trackViewItemList(
            activeFilter,
            activeFilter === "all" ? "Tienda FortLoot" : `Tienda - ${activeFilter}`,
            processedItems.slice(0, 20).map((item) => ({
              id: item.id,
              name: item.name,
              type: item.type || "ITEM",
              rarity: item.rarity,
              price: (item.price?.finalPrice || 0) / 100,
              quantity: 1,
            }))
          )
        } else {
          logger.warn(`⚠️ API returned empty array for filter: "${activeFilter}"`)
          setError("No se encontraron ítems con los filtros actuales. Intenta con otro filtro.")
          setItems([])
          setOriginalItems([])
        }
      } else {
        throw new Error("Formato de respuesta inválido")
      }
    } catch (err) {
      logger.error(`❌ Error fetching items for filter "${activeFilter}":`, err)
      setError(`Error al cargar los artículos: ${err instanceof Error ? err.message : "Error desconocido"}`)
      setItems([])
      setOriginalItems([])
    } finally {
      setLoading(false)
    }
  }, [activeFilter])

  // Reemplazar el efecto de filtrado por búsqueda con esta nueva versión
  useEffect(() => {
    // Si no hay búsqueda, restaurar los elementos originales
    if (searchQuery === "") {
      setItems(originalItems)
      return
    }

    // Filtrar desde los elementos originales, no desde los ya filtrados
    const filtered = originalItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Actualizar los elementos mostrados con el resultado del filtrado
    setItems(filtered)
    // Resetear a la primera página cuando cambian los resultados de búsqueda
    setCurrentPage(1)

    // Track search (debounced - only track if search query is meaningful)
    if (searchQuery.length >= 3) {
      trackSearch(searchQuery, filtered.length)
    }
  }, [searchQuery, originalItems])

  // Modificar el efecto que carga los datos para usar la función fetchItems
  useEffect(() => {
    if (isClient) {
      fetchItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, isClient])

  // Calcular los ítems a mostrar en la página actual
  const displayedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return items.slice(startIndex, endIndex)
  }, [items, currentPage])

  // Función para cambiar de página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll al inicio de los resultados
    if (typeof window !== "undefined") {
      const element = document.getElementById("store-results")
      if (element) {
        window.scrollTo({
          top: element.offsetTop - 100,
          behavior: "smooth",
        })
      }
    }
  }, [])

  // Animación para los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // No renderizar nada hasta que el cliente esté inicializado
  if (!isClient) {
    return null
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Spacer - smaller when promotions are visible since banner replaces header */}
      {/* Wait for promotions to load to avoid layout shift */}
      <div className={isLoadingPromotions ? "h-16" : hasPromotions ? "h-8" : "h-32"} style={{ transition: 'height 0.3s ease-out' }}></div>

      <div className="fixed inset-0 z-0">
        <OptimizedImage
          src={IMAGES.NEON_GAMING_NEW}
          alt="Gaming Background"
          fill
          className="object-cover blur-[4px] brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      <div className="relative z-20">
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Back Button (Mobile) */}
          <div className="md:hidden mb-4">
            <Link href={`/${locale}`} className="inline-flex items-center text-[#00F5D4] hover:text-[#FF007A] transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>{t("back")}</span>
            </Link>
          </div>

          {/* Title - Hidden when promotions banner is visible, wait for promotions to load first */}
          <AnimatePresence mode="wait">
            {!isLoadingPromotions && !hasPromotions && (
              <motion.div
                key="store-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center mb-12"
              >
                <h1 className="text-4xl md:text-5xl font-['Russo_One'] mb-2 relative inline-block">
                  <span className="text-white">
                    {t("title")} <span className="text-primary neon-text">FortLoot</span>
                  </span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100px" }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="h-1 bg-primary mx-auto mt-2"
                  />
                </h1>
                <p className="text-xl text-secondary neon-text-cyan mt-4 mb-6">
                  {t("subtitle")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <StoreFilters
            activeFilter={activeFilter}
            handleFilterChange={handleFilterChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Fallback Data Notice */}
          {usingFallback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/20 border border-yellow-500/50 text-white p-4 rounded-lg mb-6 flex items-center"
            >
              <Info className="w-5 h-5 mr-2 flex-shrink-0 text-yellow-400" />
              <p>{t("fallbackNotice")}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-lg mb-6 flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Debug Info - Solo visible cuando se activa el modo debug */}
              {debugMode && items.length > 0 && (
                <div className="bg-black/50 p-4 mb-6 rounded-lg text-xs overflow-auto max-h-40">
                  <h3 className="font-bold mb-2">Debug - Primer ítem:</h3>
                  <pre>{JSON.stringify(items[0], null, 2)}</pre>
                </div>
              )}

              {/* Store Items Grid */}
              <div id="store-results">
                {items.length > 0 ? (
                  <>
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                      {displayedItems.map((item) => (
                        <StoreItem key={item.id} item={item} />
                      ))}
                    </motion.div>

                    {/* Paginación */}
                    {items.length > ITEMS_PER_PAGE && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(items.length / ITEMS_PER_PAGE)}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                ) : (
                  <EmptyState onReset={() => handleFilterChange("all")} />
                )}
              </div>
            </>
          )}

          {/* Countdown Timer */}
          <CountdownTimer />
        </main>
      </div>
    </div>
  )
}
