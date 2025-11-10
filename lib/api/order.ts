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

export interface Order {
  id: string
  orderNumber: string
  customerEpicId: string
  customerName: string
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
   * Crear una nueva orden (usa API_SECRET para autenticación)
   */
  async create(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    return apiClient.post<CreateOrderResponse>('/orders', data, undefined, true)
  },

  /**
   * Obtener detalles de una orden por ID (usa API_SECRET)
   */
  async getById(orderId: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`, undefined, true)
  },

  /**
   * Obtener orden por número de orden (usa API_SECRET)
   */
  async getByOrderNumber(orderNumber: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/number/${orderNumber}`, undefined, true)
  },

  /**
   * Obtener órdenes del cliente (usa API_SECRET)
   */
  async getByCustomer(epicAccountId: string): Promise<Order[]> {
    return apiClient.get<Order[]>(`/orders/customer/${epicAccountId}`, undefined, true)
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

    return apiClient.upload<Order>(`/payments/orders/${orderId}/proof`, formData)
  },

  /**
   * Cancelar orden (usa API_SECRET)
   */
  async cancel(orderId: string): Promise<Order> {
    return apiClient.patch<Order>(`/orders/${orderId}/cancel`, undefined, undefined, true)
  },
}
