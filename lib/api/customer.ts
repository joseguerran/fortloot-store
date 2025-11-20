/**
 * Customer API Service
 * Gestión de sesiones de clientes y verificación
 */

import { apiClient } from './client'

export interface Customer {
  id: string
  epicAccountId: string
  displayName?: string
  email: string
  sessionToken: string
  tier: 'REGULAR' | 'VIP' | 'PREMIUM'
  isBlacklisted: boolean
  totalOrders: number
  totalSpent: number
  lifetimeValue: number
}

export interface CreateSessionRequest {
  epicAccountId: string
  email: string
  cartItems?: Array<{
    type: string
  }>
}

export interface CreateSessionResponse {
  customer: Omit<Customer, 'sessionToken'>
  sessionToken: string
}

export interface VerifyFriendshipResponse {
  hasReadyFriendship: boolean
  availableBots: Array<{
    botId: string
    botName: string
    canGiftAt: string
  }>
}

export const customerAPI = {
  /**
   * Crear o recuperar sesión de cliente (ahora usa API route local)
   */
  async createSession(data: CreateSessionRequest): Promise<Customer> {
    const response = await apiClient.post<CreateSessionResponse>('/api/customers/session', data)
    // Combinar customer y sessionToken en un solo objeto
    return {
      ...response.customer,
      sessionToken: response.sessionToken
    }
  },

  /**
   * Verificar si el cliente tiene amistades listas para recibir regalos
   */
  async verifyFriendship(epicAccountId: string): Promise<VerifyFriendshipResponse> {
    return apiClient.get<VerifyFriendshipResponse>(
      `/api/customers/verify-friendship?epicAccountId=${encodeURIComponent(epicAccountId)}`
    )
  },

  /**
   * Obtener estadísticas del cliente
   */
  async getStats(epicAccountId: string) {
    return apiClient.get(`/api/customers/${epicAccountId}/stats`)
  },
}
