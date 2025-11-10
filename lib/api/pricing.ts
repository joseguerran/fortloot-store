/**
 * Pricing API Service
 * Cálculo de precios con márgenes y descuentos
 */

import { apiClient } from './client'

export interface PriceBreakdown {
  basePrice: number
  profitAmount: number
  discountAmount: number
  finalPrice: number
  vbucksPrice?: number
}

export interface CalculatePriceRequest {
  itemId?: string // Si es item del catálogo
  baseVbucks?: number // Si tiene precio en V-Bucks
  basePriceUsd?: number // Si tiene precio directo en USD
  customerEpicId?: string // Para aplicar descuentos por tier
}

export interface CalculateCartRequest {
  items: Array<{
    itemId: string
    quantity: number
  }>
  customerEpicId?: string
}

export interface CartTotal {
  items: Array<{
    itemId: string
    quantity: number
    price: PriceBreakdown
  }>
  subtotal: number
  totalDiscount: number
  totalProfit: number
  total: number
}

export const pricingAPI = {
  /**
   * Calcular precio de un item individual
   */
  async calculatePrice(data: CalculatePriceRequest): Promise<PriceBreakdown> {
    return apiClient.post<PriceBreakdown>('/pricing/calculate', data)
  },

  /**
   * Calcular precio total del carrito
   */
  async calculateCart(data: CalculateCartRequest): Promise<CartTotal> {
    return apiClient.post<CartTotal>('/pricing/calculate-cart', data)
  },

  /**
   * Obtener configuración de precios (solo admin)
   */
  async getConfig() {
    return apiClient.get('/pricing/config')
  },
}
