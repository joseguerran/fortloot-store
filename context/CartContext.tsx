"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { StoreItem } from "@/types"
import { useCustomer } from "./CustomerContext"
import { trackAddToCart, trackRemoveFromCart, trackViewCart, type CartItem as AnalyticsCartItem } from "@/lib/analytics"

// Cart total type (no longer from pricing API)
export type CartTotal = {
  items: Array<{
    itemId: string
    quantity: number
    price: {
      basePrice: number
      profitAmount: number
      discountAmount: number
      finalPrice: number
      vbucksPrice?: number
    }
  }>
  subtotal: number
  totalDiscount: number
  totalProfit: number
  total: number
}

// Definir el tipo para los items del carrito
export interface CartItem extends StoreItem {
  quantity: number
  calculatedPrice?: {
    basePrice: number
    profitAmount: number
    discountAmount: number
    finalPrice: number
  }
}

// Definir el tipo para el contexto del carrito
interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: StoreItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  totalItems: number
  totalPrice: number
  cartTotal: CartTotal | null
  isLoadingPrices: boolean
  refreshPrices: () => Promise<void>
  hasManualItems: () => boolean
}

// Crear el contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "fortloot-cart"

// Proveedor del contexto
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [cartTotal, setCartTotal] = useState<CartTotal | null>(null)
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)

  const { customer } = useCustomer()

  // Inicializar el estado del cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Cargar el carrito desde localStorage cuando el componente se monta
  useEffect(() => {
    if (isClient) {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch {
          localStorage.removeItem(CART_STORAGE_KEY)
        }
      }
    }
  }, [isClient])

  // Guardar el carrito en localStorage cuando cambia
  useEffect(() => {
    if (isClient) {
      if (cartItems.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
      } else {
        localStorage.removeItem(CART_STORAGE_KEY)
      }
    }
  }, [cartItems, isClient])

  // Calcular precios desde la API cuando cambian los items o el customer
  // TEMPORALMENTE DESHABILITADO: El cálculo automático de precios desde el backend
  // causa loops infinitos con items que no están en el catálogo del backend
  // TODO: Implementar correctamente cuando el catálogo esté sincronizado
  /*
  useEffect(() => {
    if (cartItems.length > 0 && isClient) {
      refreshPrices()
    } else {
      setCartTotal(null)
    }
    // Solo ejecutar cuando cambie la longitud del carrito o el customer ID
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length, customer?.epicAccountId, isClient])
  */

  // Función para calcular precios desde la API
  const refreshPrices = async () => {
    if (cartItems.length === 0) {
      setCartTotal(null)
      return
    }

    setIsLoadingPrices(true)

    try {
      // Los precios ya vienen calculados del backend en el catálogo
      // Solo necesitamos totalizar
      const items = cartItems.map((item) => ({
        itemId: item.id,
        quantity: item.quantity,
        price: {
          basePrice: item.price.regularPrice,
          profitAmount: 0, // Ya incluido en finalPrice
          discountAmount: item.price.regularPrice - item.price.finalPrice,
          finalPrice: item.price.finalPrice,
          vbucksPrice: item.vbucksPrice,
        },
      }))

      const subtotal = items.reduce((sum, item) => sum + (item.price.basePrice * item.quantity), 0)
      const totalDiscount = items.reduce((sum, item) => sum + (item.price.discountAmount * item.quantity), 0)
      const total = items.reduce((sum, item) => sum + (item.price.finalPrice * item.quantity), 0)

      const cartTotal = {
        items,
        subtotal,
        totalDiscount,
        totalProfit: 0, // No exponer márgenes al cliente
        total,
      }

      setCartTotal(cartTotal)

      // Los items ya tienen sus precios desde el catálogo
      // No necesitamos actualizar nada más
    } catch {
      setCartTotal(null)
    } finally {
      setIsLoadingPrices(false)
    }
  }

  // Calcular el total de items en el carrito
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0)

  // Calcular el precio total
  // Priorizar cartTotal de la API, sino usar el precio del backend (ya viene en centavos)
  const totalPrice = cartTotal
    ? cartTotal.total
    : cartItems.reduce((total, item) => {
        // Precio final del backend (en centavos), convertir a USD
        const itemPriceCents = item.price?.finalPrice || 0
        const itemPriceUSD = itemPriceCents / 100
        return total + itemPriceUSD * item.quantity
      }, 0)

  // Añadir un item al carrito
  const addToCart = (item: StoreItem) => {
    setCartItems((prevItems) => {
      // Verificar si el item ya está en el carrito
      const existingItemIndex = prevItems.findIndex((cartItem) => cartItem.id === item.id)

      if (existingItemIndex >= 0) {
        // Si el item ya está en el carrito, incrementar la cantidad
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        }
        return updatedItems
      } else {
        // Si el item no está en el carrito, añadirlo con cantidad 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })

    // Track add to cart event
    trackAddToCart({
      id: item.id,
      name: item.name,
      type: item.type || 'ITEM',
      rarity: item.rarity,
      price: (item.price?.finalPrice || 0) / 100,
      quantity: 1,
    })

    // El carrito ya no se abre automáticamente - el usuario debe hacer click en el ícono
  }

  // Eliminar un item del carrito
  const removeFromCart = (itemId: string) => {
    // Get item before removing for analytics
    const itemToRemove = cartItems.find((item) => item.id === itemId)

    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId))

    // Track remove from cart event
    if (itemToRemove) {
      trackRemoveFromCart({
        id: itemToRemove.id,
        name: itemToRemove.name,
        type: itemToRemove.type || 'ITEM',
        rarity: itemToRemove.rarity,
        price: (itemToRemove.price?.finalPrice || 0) / 100,
        quantity: itemToRemove.quantity,
      })
    }
  }

  // Actualizar la cantidad de un item en el carrito
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setCartItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
  }

  // Limpiar el carrito
  const clearCart = () => {
    setCartItems([])
    setCartTotal(null)
  }

  // Abrir el carrito
  const openCart = () => {
    setIsCartOpen(true)

    // Track view cart event
    if (cartItems.length > 0) {
      trackViewCart(
        cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type || 'ITEM',
          rarity: item.rarity,
          price: (item.price?.finalPrice || 0) / 100,
          quantity: item.quantity,
        }))
      )
    }
  }

  // Cerrar el carrito
  const closeCart = () => setIsCartOpen(false)

  // Alternar el estado del carrito
  const toggleCart = () => setIsCartOpen((prev) => !prev)

  // Verificar si el carrito tiene items que requieren procesamiento manual
  const hasManualItems = () => {
    return cartItems.some((item) => item.requiresManualProcess === true)
  }

  // Valor del contexto
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    totalItems,
    totalPrice,
    cartTotal,
    isLoadingPrices,
    refreshPrices,
    hasManualItems,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook personalizado para usar el contexto
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider")
  }
  return context
}
