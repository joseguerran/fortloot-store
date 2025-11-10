/**
 * Catalog API Service
 * Gestión del catálogo de items de Fortnite
 */

import { apiClient } from './client'

export interface CatalogItem {
  id: string
  itemId?: string
  name: string
  description: string
  type: 'VBUCKS' | 'SKIN' | 'EMOTE' | 'PICKAXE' | 'GLIDER' | 'BACKPACK' | 'WRAP' | 'BATTLE_PASS' | 'BUNDLE' | 'OTHER'
  rarity?: string
  image: string
  baseVbucks?: number
  basePriceUsd?: number
  profitMargin?: number
  discount: number
  flashSalePrice?: number
  flashSaleEndsAt?: string
  isCustom: boolean
  isActive: boolean
  requiresManualProcess: boolean
  tags: string[]
  bundleItems?: any
  createdAt: string
  updatedAt: string
}

export interface CurrentCatalog {
  id: string
  shopClosesAt: string
  itemCount: number
  apiItems: number
  customItems: number
  items: CatalogItem[]
  updatedAt: string
}

export const catalogAPI = {
  /**
   * Obtener el catálogo actual activo
   */
  async getCurrentCatalog(): Promise<CurrentCatalog> {
    return apiClient.get<CurrentCatalog>('/catalog/current')
  },

  /**
   * Obtener un item específico del catálogo por ID
   */
  async getCatalogItem(itemId: string): Promise<CatalogItem> {
    return apiClient.get<CatalogItem>(`/catalog/items/${itemId}`)
  },

  /**
   * Sincronizar catálogo con Fortnite API (solo admin)
   */
  async syncCatalog() {
    return apiClient.post('/catalog/sync', {}, {}, true)
  },
}
