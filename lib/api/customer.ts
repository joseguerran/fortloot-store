/**
 * Customer API Service
 * Gestión de sesiones de clientes y verificación
 */

import { apiClient } from './client'

export type ContactPreference = 'EMAIL' | 'WHATSAPP'

export interface Customer {
  id: string
  epicAccountId: string
  displayName?: string
  email?: string
  phoneNumber?: string
  contactPreference: ContactPreference
  sessionToken: string
  tier: 'REGULAR' | 'VIP' | 'PREMIUM'
  isBlacklisted: boolean
  totalOrders: number
  totalSpent: number
  lifetimeValue: number
}

export interface CreateSessionRequest {
  epicAccountId: string
  contactPreference: ContactPreference
  email?: string       // Requerido si contactPreference es EMAIL
  phoneNumber?: string // Requerido si contactPreference es WHATSAPP
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
   * Nota: Solo retorna sessionToken, los datos del cliente se obtienen via getMe()
   */
  async createSession(data: CreateSessionRequest): Promise<{ sessionToken: string }> {
    const response = await apiClient.post<CreateSessionResponse>('/api/customers/session', data)
    return { sessionToken: response.sessionToken }
  },

  /**
   * Obtener datos del cliente actual
   * Session token is sent via httpOnly cookie automatically
   * Returns null if not authenticated (401) - this is expected for unauthenticated users
   */
  async getMe(): Promise<Omit<Customer, 'sessionToken'> | null> {
    const response = await fetch('/api/customers/me', {
      credentials: 'include', // Include httpOnly cookie
    })

    // Return null for 401 - user is not authenticated, this is expected
    if (response.status === 401) {
      return null
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch customer data')
    }

    const data = await response.json()
    return data.data
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
