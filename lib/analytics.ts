/**
 * Google Analytics 4 - FortLoot Analytics Library
 *
 * Eventos trackeados:
 *
 * FUNNEL PRINCIPAL:
 * 1. page_view (automático)
 * 2. view_item_list - Usuario ve el catálogo
 * 3. view_item - Usuario ve detalle de producto
 * 4. add_to_cart - Agrega al carrito
 * 5. view_cart - Abre el carrito
 * 6. begin_checkout - Inicia checkout
 * 7. epic_id_confirmed - Confirma su Epic ID
 * 8. purchase - Orden creada exitosamente
 * 9. payment_uploaded - Sube comprobante
 * 10. order_completed - Orden completada (regalo enviado)
 *
 * EVENTOS ADICIONALES:
 * - remove_from_cart
 * - search (búsqueda de productos)
 * - epic_id_search (búsqueda de Epic ID)
 * - otp_requested / otp_verified (autenticación)
 * - order_status_viewed
 * - filter_applied (filtros en tienda)
 */

// Tipos para los items de e-commerce (estándar GA4)
export interface GA4Item {
  item_id: string
  item_name: string
  item_category?: string  // OUTFIT, PICKAXE, EMOTE, etc.
  item_category2?: string // Rarity: LEGENDARY, EPIC, etc.
  price: number
  quantity: number
  currency?: string
}

// Tipo para el carrito
export interface CartItem {
  id: string
  name: string
  type: string
  rarity?: string
  price: number
  quantity: number
}

// Helper para convertir items del carrito a formato GA4
const toGA4Items = (items: CartItem[]): GA4Item[] => {
  return items.map(item => ({
    item_id: item.id,
    item_name: item.name,
    item_category: item.type,
    item_category2: item.rarity,
    price: item.price,
    quantity: item.quantity,
    currency: 'USD'
  }))
}

// Helper para calcular el valor total
const calculateValue = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

// Función base para enviar eventos a GA4
const sendEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)

    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GA4] ${eventName}`, params)
    }
  }
}

// ============================================
// EVENTOS E-COMMERCE ESTÁNDAR GA4
// ============================================

/**
 * Usuario ve el listado de productos (catálogo/tienda)
 */
export const trackViewItemList = (
  listId: string,
  listName: string,
  items: CartItem[]
) => {
  sendEvent('view_item_list', {
    item_list_id: listId,
    item_list_name: listName,
    items: toGA4Items(items)
  })
}

/**
 * Usuario ve un producto específico
 */
export const trackViewItem = (item: CartItem) => {
  sendEvent('view_item', {
    currency: 'USD',
    value: item.price,
    items: toGA4Items([item])
  })
}

/**
 * Usuario agrega producto al carrito
 */
export const trackAddToCart = (item: CartItem) => {
  sendEvent('add_to_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: toGA4Items([item])
  })
}

/**
 * Usuario elimina producto del carrito
 */
export const trackRemoveFromCart = (item: CartItem) => {
  sendEvent('remove_from_cart', {
    currency: 'USD',
    value: item.price * item.quantity,
    items: toGA4Items([item])
  })
}

/**
 * Usuario abre/ve el carrito
 */
export const trackViewCart = (items: CartItem[]) => {
  sendEvent('view_cart', {
    currency: 'USD',
    value: calculateValue(items),
    items: toGA4Items(items)
  })
}

/**
 * Usuario inicia el proceso de checkout
 */
export const trackBeginCheckout = (items: CartItem[]) => {
  sendEvent('begin_checkout', {
    currency: 'USD',
    value: calculateValue(items),
    items: toGA4Items(items)
  })
}

/**
 * Compra completada (orden creada)
 */
export const trackPurchase = (
  orderId: string,
  orderNumber: string,
  items: CartItem[],
  totalValue: number
) => {
  sendEvent('purchase', {
    transaction_id: orderId,
    affiliation: 'FortLoot Store',
    value: totalValue,
    currency: 'USD',
    items: toGA4Items(items),
    // Custom dimensions
    order_number: orderNumber
  })
}

// ============================================
// EVENTOS CUSTOM FORTLOOT
// ============================================

/**
 * Usuario busca su Epic ID
 */
export const trackEpicIdSearch = (query: string) => {
  sendEvent('epic_id_search', {
    search_term: query
  })
}

/**
 * Usuario confirma/selecciona su Epic ID
 */
export const trackEpicIdConfirmed = (epicId: string, displayName: string) => {
  sendEvent('epic_id_confirmed', {
    epic_id: epicId,
    display_name: displayName
  })
}

/**
 * Usuario sube comprobante de pago
 */
export const trackPaymentUploaded = (orderNumber: string, amount: number) => {
  sendEvent('payment_uploaded', {
    order_number: orderNumber,
    value: amount,
    currency: 'USD'
  })
}

/**
 * Pago verificado por admin
 */
export const trackPaymentVerified = (orderNumber: string) => {
  sendEvent('payment_verified', {
    order_number: orderNumber
  })
}

/**
 * Orden completada (regalo enviado)
 */
export const trackOrderCompleted = (orderNumber: string, value: number) => {
  sendEvent('order_completed', {
    order_number: orderNumber,
    value: value,
    currency: 'USD'
  })
}

/**
 * Usuario ve el estado de una orden
 */
export const trackOrderStatusViewed = (orderNumber: string, status: string) => {
  sendEvent('order_status_viewed', {
    order_number: orderNumber,
    order_status: status
  })
}

/**
 * Usuario solicita código OTP
 */
export const trackOtpRequested = (method: 'email') => {
  sendEvent('otp_requested', {
    method: method
  })
}

/**
 * Usuario verifica OTP exitosamente
 */
export const trackOtpVerified = () => {
  sendEvent('otp_verified')
}

/**
 * Usuario aplica filtro en tienda
 */
export const trackFilterApplied = (
  filterType: string,
  filterValue: string
) => {
  sendEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue
  })
}

/**
 * Búsqueda de productos
 */
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  sendEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount
  })
}

/**
 * Click en CTA principal (Hero, banners, etc.)
 */
export const trackCtaClick = (ctaName: string, ctaLocation: string) => {
  sendEvent('cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation
  })
}

/**
 * Error en el flujo
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  context?: string
) => {
  sendEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    error_context: context
  })
}

// ============================================
// USER PROPERTIES
// ============================================

/**
 * Establecer propiedades del usuario
 */
export const setUserProperties = (properties: {
  customer_tier?: string
  has_orders?: boolean
  epic_id?: string
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties)

    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] User Properties Set:', properties)
    }
  }
}

/**
 * Establecer User ID (para tracking cross-device)
 */
export const setUserId = (epicId: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_id: epicId })

    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] User ID Set:', epicId)
    }
  }
}

// Type declaration para gtag
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set',
      targetOrParams: string | Record<string, any>,
      params?: Record<string, any>
    ) => void
    dataLayer: any[]
  }
}
