import { NextResponse } from "next/server"
import type { StoreItem, PriceInfo } from "@/types"

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api'
const API_SECRET = process.env.API_SECRET

// Mapeo de tipos del backend a tipos del frontend
const TYPE_MAPPING: Record<string, string> = {
  'VBUCKS': 'vbucks',
  'SKIN': 'outfit',
  'EMOTE': 'emote',
  'PICKAXE': 'pickaxe',
  'GLIDER': 'glider',
  'BACKPACK': 'backpack',
  'WRAP': 'wrap',
  'BATTLE_PASS': 'battle_pass',
  'BUNDLE': 'bundle',
  'OTHER': 'outfit',
}

// Función para convertir CatalogItem del backend a StoreItem del frontend
function transformCatalogItem(item: any): StoreItem {
  // El backend devuelve precios en USD (dólares), pero el frontend espera centavos
  // Por ejemplo: 8.49 USD -> 849 centavos

  // Usar el precio calculado si está disponible, sino usar basePriceUsd
  const priceInUSD = item.calculatedPrice?.finalPrice || item.basePriceUsd || 0
  const basePriceInUSD = item.calculatedPrice?.basePrice || item.basePriceUsd || priceInUSD

  // Convertir a centavos (multiplicar por 100)
  let finalPrice = Math.round(priceInUSD * 100)
  let regularPrice = Math.round(basePriceInUSD * 100)

  // Si hay flash sale, usar ese precio
  if (item.flashSalePrice && item.flashSaleEndsAt) {
    const saleEnds = new Date(item.flashSaleEndsAt)
    if (saleEnds > new Date()) {
      finalPrice = Math.round(item.flashSalePrice * 100)
    }
  }

  const price: PriceInfo = {
    regularPrice: regularPrice,
    finalPrice: finalPrice,
    floorPrice: 0,
  }

  // Determinar badge
  let badge: string | undefined
  if (item.flashSalePrice && item.flashSaleEndsAt) {
    const saleEnds = new Date(item.flashSaleEndsAt)
    if (saleEnds > new Date()) {
      badge = 'OFERTA FLASH'
    }
  }

  if (!badge && item.discount > 0) {
    badge = `${item.discount}% OFF`
  }

  if (!badge && item.type === 'BATTLE_PASS') {
    badge = 'EXCLUSIVO'
  }

  if (!badge && item.type === 'BUNDLE') {
    badge = 'PAQUETE'
  }

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: price,
    image: item.image,
    rarity: item.rarity?.toLowerCase() || 'common',
    type: TYPE_MAPPING[item.type] || 'outfit',
    badge: badge,
    vbucksPrice: item.baseVbucks,
    requiresManualProcess: item.requiresManualProcess || false,
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || ''

    // Llamar al backend para obtener el catálogo actual
    let response = await fetch(`${API_BASE_URL}/catalog/current`, {
      headers: {
        'x-api-key': API_SECRET!,
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json({
        items: [],
        error: 'Error al cargar el catálogo',
        usingFallback: true,
      })
    }

    let catalogData = await response.json()

    if (!catalogData.success || !catalogData.data) {
      return NextResponse.json({
        items: [],
        error: 'Respuesta inválida del catálogo',
        usingFallback: true,
      })
    }

    const data = catalogData.data
    const catalog = data.catalog || {}
    let items = data.items || []

    // FRONTEND FALLBACK: If no items, trigger backend sync and retry
    if (items.length === 0) {
      try {
        // Trigger sync endpoint
        const syncResponse = await fetch(`${API_BASE_URL}/catalog/update`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_SECRET!,
          },
        })

        if (syncResponse.ok) {
          // Wait a moment for sync to complete
          await new Promise(resolve => setTimeout(resolve, 3000))

          // Retry fetching catalog
          const retryResponse = await fetch(`${API_BASE_URL}/catalog/current`, {
            headers: {
              'x-api-key': API_SECRET!,
            },
            cache: 'no-store',
            next: { revalidate: 0 },
          })

          if (retryResponse.ok) {
            const retryCatalogData = await retryResponse.json()
            if (retryCatalogData.success && retryCatalogData.data) {
              items = retryCatalogData.data.items || []
            }
          }
        }
      } catch {
        // Sync failed, continue with empty catalog
      }
    }

    // Filtrar solo items activos
    items = items.filter((item: any) => item.isActive)

    // Aplicar filtro si existe
    if (filter) {
      if (filter === 'vbucks') {
        items = items.filter((item: any) => item.type === 'VBUCKS')
      } else if (filter === 'crew') {
        items = items.filter((item: any) => item.type === 'BATTLE_PASS')
      } else if (filter === 'bundle') {
        items = items.filter((item: any) => item.type === 'BUNDLE')
      } else if (filter === 'store') {
        // Filtrar todo excepto vbucks, crew y bundles
        items = items.filter((item: any) =>
          !['VBUCKS', 'BATTLE_PASS', 'BUNDLE'].includes(item.type)
        )
      }
      // Si filter === 'all', no filtrar nada
    }

    // Transformar items del backend al formato del frontend
    const storeItems: StoreItem[] = items.map(transformCatalogItem)

    return NextResponse.json({
      items: storeItems,
      shopClosesAt: catalog.shopClosesAt,
      itemCount: storeItems.length,
    })
  } catch (error) {
    return NextResponse.json({
      items: [],
      error: error instanceof Error ? error.message : 'Error desconocido',
      usingFallback: true,
    }, { status: 500 })
  }
}
