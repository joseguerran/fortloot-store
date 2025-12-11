/**
 * Order API Service
 * Creación y gestión de órdenes
 */

import { apiClient } from './client'

export type OrderStatus =
  | 'PENDING'
  | 'PENDING_PAYMENT'
  | 'PAYMENT_UPLOADED'
  | 'PAYMENT_VERIFIED'
  | 'WAITING_FRIENDSHIP'
  | 'WAITING_PERIOD'
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface CustomerInfo {
  id: string
  displayName: string
  epicAccountId?: string
  email?: string
  tier: 'REGULAR' | 'VIP' | 'PREMIUM'
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  // Customer relation - preferred way to access customer data
  customer?: CustomerInfo
  // Legacy fields - deprecated, use customer relation instead
  customerEpicId?: string
  customerName?: string
  customerEmail?: string
  productId: string
  productName: string
  productType: string
  itemId: string
  quantity: number
  basePrice: number
  profitAmount: number
  discountAmount: number
  finalPrice: number
  price: number // Legacy
  currency: string
  paymentMethod?: string
  paymentProof?: string // Legacy
  paymentProofUrl?: string
  status: OrderStatus
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'VIP'
  assignedBotId?: string
  attempts: number
  maxAttempts: number
  estimatedDelivery?: string
  expiresAt?: string
  completedAt?: string
  failedAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  customerId: string
  items: Array<{
    catalogItemId: string
    quantity: number
    priceAtPurchase: number
  }>
  totalAmount: number
  subtotalAmount: number
  discountAmount: number
  profitAmount: number
  locale?: 'es' | 'en'
}

export interface CreateOrderResponse {
  orderId: string
  orderNumber: string
  status: string
  totalAmount: number
  expiresAt: string
}

export const orderAPI = {
  /**
   * Crear una nueva orden (ahora usa API route local)
   */
  async create(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return apiClient.post<CreateOrderResponse>('/api/orders', data)
  },

  /**
   * Obtener detalles de una orden por ID
   */
  async getById(orderId: string): Promise<Order> {
    return apiClient.get<Order>(`/api/orders/${orderId}`)
  },

  /**
   * Obtener orden por número de orden
   */
  async getByOrderNumber(orderNumber: string): Promise<Order> {
    return apiClient.get<Order>(`/api/orders/number/${orderNumber}`)
  },

  /**
   * Obtener órdenes del cliente
   */
  async getByCustomer(epicAccountId: string): Promise<Order[]> {
    return apiClient.get<Order[]>(`/api/orders?customerId=${epicAccountId}`)
  },

  /**
   * Subir comprobante de pago
   */
  async uploadPaymentProof(
    orderId: string,
    file: File,
    paymentMethod: string,
    transactionId?: string,
    notes?: string
  ): Promise<Order> {
    const formData = new FormData()
    formData.append('paymentProof', file)
    formData.append('paymentMethod', paymentMethod)
    if (transactionId) formData.append('transactionId', transactionId)
    if (notes) formData.append('notes', notes)

    return apiClient.upload<Order>(`/api/payments/orders/${orderId}/proof`, formData)
  },

  /**
   * Cancelar orden
   */
  async cancel(orderId: string): Promise<Order> {
    return apiClient.patch<Order>(`/api/orders/${orderId}/cancel`)
  },
}
