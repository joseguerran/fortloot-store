/**
 * API Services Index
 * Exportación centralizada de todos los servicios de API
 */

// Exportar tipos y clases del cliente
export * from './client'

// Exportar tipos de customer
export type { Customer, CreateSessionRequest, VerifyFriendshipResponse } from './customer'
// Exportar el objeto customerAPI
export { customerAPI } from './customer'

// Exportar tipos de pricing
export type { PriceBreakdown, CalculatePriceRequest, CalculateCartRequest, CartTotal } from './pricing'
// Exportar el objeto pricingAPI
export { pricingAPI } from './pricing'

// Exportar tipos de order
export type { OrderStatus, Order, CreateOrderRequest, CreateOrderResponse } from './order'
// Exportar el objeto orderAPI
export { orderAPI } from './order'

// Exportar tipos de catalog
export type { CatalogItem, CurrentCatalog } from './catalog'
// Exportar el objeto catalogAPI
export { catalogAPI } from './catalog'
