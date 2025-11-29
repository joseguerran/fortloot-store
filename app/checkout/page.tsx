"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { useCustomer } from "@/context/CustomerContext"
import { useConfig } from "@/context/ConfigContext"
import { EpicIdVerifier } from "@/components/checkout/EpicIdVerifier"
import { OrderSummary } from "@/components/checkout/OrderSummary"
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector"
import { PaymentUploader } from "@/components/checkout/PaymentUploader"
import { ManualCheckoutMessage } from "@/components/checkout/ManualCheckoutMessage"
import { UserSession } from "@/components/checkout/UserSession"
import { orderAPI } from "@/lib/api/order"
import { ChevronLeft, ChevronRight, Check, Loader2, ArrowLeft } from "lucide-react"
import { trackBeginCheckout, trackEpicIdConfirmed, trackPurchase, setUserId, setUserProperties } from "@/lib/analytics"

interface PaymentMethod {
  id: string
  slug: string
  name: string
  description?: string
  instructions?: string
}

const STEPS = [
  { id: 1, name: "Verificar Cuenta", description: "Epic ID" },
  { id: 2, name: "Método de Pago", description: "Selecciona tu método" },
  { id: 3, name: "Revisar Orden", description: "Confirma tu compra" },
  { id: 4, name: "Comprobante", description: "Sube tu comprobante" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, cartTotal, clearCart, hasManualItems } = useCart()
  const { manualCheckoutEnabled } = useConfig()
  const customerContext = useCustomer()
  const customer = customerContext?.customer || null
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const beginCheckoutTracked = useRef(false)

  // Track begin_checkout on mount (only once)
  useEffect(() => {
    if (cartItems.length > 0 && !beginCheckoutTracked.current) {
      beginCheckoutTracked.current = true
      trackBeginCheckout(
        cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type || "ITEM",
          rarity: item.rarity,
          price: (item.price?.finalPrice || 0) / 100,
          quantity: item.quantity,
        }))
      )
    }
  }, [cartItems])

  // Detectar si hay items manuales y el feature está habilitado
  const shouldUseManualFlow = manualCheckoutEnabled && hasManualItems()
  const manualItems = cartItems.filter(item => item.requiresManualProcess === true)

  useEffect(() => {
    if (cartItems.length === 0 && currentStep < 4) {
      router.push("/tienda")
    }
  }, [cartItems, router, currentStep])

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payment-methods?active=true')
        const data = await response.json()
        if (data.success) {
          setPaymentMethods(data.data)
        }
      } catch {
        // Silently fail - payment methods will show empty state
      }
    }
    fetchPaymentMethods()
  }, [])

  // Handle payment method selection
  const handlePaymentMethodSelect = (slug: string) => {
    setPaymentMethod(slug)
    const method = paymentMethods.find(m => m.slug === slug)
    setSelectedPaymentMethod(method || null)
  }

  // Get payment method name by slug
  const getPaymentMethodName = (slug: string | null): string => {
    if (!slug) return "No seleccionado"
    const method = paymentMethods.find(m => m.slug === slug)
    return method?.name || slug
  }

  const handleCreateOrder = async () => {
    if (!customer || !paymentMethod) {
      setOrderError("Falta información del cliente o método de pago")
      return
    }

    if (cartItems.length === 0) {
      setOrderError("El carrito está vacío")
      return
    }

    setIsCreatingOrder(true)
    setOrderError(null)

    try {
      // Calcular totales
      let totalAmount = 0
      let subtotalAmount = 0
      let totalDiscount = 0
      let totalProfit = 0

      // Mapear items al formato correcto del backend
      const items = cartItems.map((item) => {
        // Buscar precio calculado desde el backend si existe
        const calculatedPrice = cartTotal?.items?.find((i) => i.itemId === item.id)?.price

        // Obtener precio del backend (ya viene en centavos)
        const itemPriceCents = item.price?.finalPrice || 0
        const itemPriceUSD = itemPriceCents / 100

        // Usar precio calculado del backend si existe, sino usar precio del item
        const basePrice = calculatedPrice?.basePrice || itemPriceUSD
        const profitAmount = calculatedPrice?.profitAmount || 0
        const discountAmount = calculatedPrice?.discountAmount || 0
        const finalPrice = calculatedPrice?.finalPrice || itemPriceUSD

        // Acumular totales
        subtotalAmount += basePrice * item.quantity
        totalDiscount += discountAmount * item.quantity
        totalProfit += profitAmount * item.quantity
        totalAmount += finalPrice * item.quantity

        return {
          catalogItemId: item.id,
          quantity: item.quantity,
          priceAtPurchase: finalPrice, // Precio final por unidad
          name: item.name, // Nombre del producto
          type: item.type, // Tipo del producto (VBUCKS, CREW, etc.)
        }
      })

      const orderData = {
        customerId: customer.id,
        items,
        totalAmount,
        subtotalAmount,
        discountAmount: totalDiscount,
        profitAmount: totalProfit,
      }

      const response = await orderAPI.create(orderData)

      // Track purchase event
      trackPurchase(
        response.orderId,
        response.orderNumber,
        cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type || "ITEM",
          rarity: item.rarity,
          price: (item.price?.finalPrice || 0) / 100,
          quantity: item.quantity,
        })),
        totalAmount
      )

      // Guardar el orderId, orderNumber y expiresAt en createdOrder para el paso 4
      setCreatedOrder({
        id: response.orderId,
        orderNumber: response.orderNumber,
        status: response.status,
        totalAmount: response.totalAmount,
        expiresAt: response.expiresAt
      } as any)
      setCurrentStep(4)
    } catch (err: any) {
      setOrderError(err.message || "Error creando orden. Por favor intenta de nuevo.")
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const handleUploadSuccess = () => {
    clearCart()
    router.push(`/order-status/${createdOrder.id}`)
  }

  const handleManualCheckoutWhatsApp = async () => {
    if (!customer) return

    // Crear orden abandonada con datos confirmados para tracking
    try {
      // Calcular totales
      let totalAmount = 0
      let subtotalAmount = 0

      const items = cartItems.map(item => {
        const itemPriceUSD = (item.price?.finalPrice || 0) / 100
        const itemTotal = itemPriceUSD * item.quantity

        totalAmount += itemTotal
        subtotalAmount += itemTotal

        return {
          catalogItemId: item.id,
          quantity: item.quantity,
          priceAtPurchase: itemPriceUSD,
          name: item.name,
          type: item.type,
        }
      })

      const orderData = {
        customerId: customer.id,
        items,
        totalAmount,
        subtotalAmount,
        discountAmount: 0,
        profitAmount: 0,
        epicAccountIdConfirmed: customer.epicAccountId,
        emailConfirmed: customer.email,
        checkoutStartedAt: new Date().toISOString(),
        hasManualItems: true,
      }

      await orderAPI.create(orderData)
    } catch {
      // Silently continue - WhatsApp flow will still work
    }

    // Generar mensaje de WhatsApp con el mismo formato que el carrito
    const whatsappNumber = "5491169755444"

    let message = 'Estoy interesado/a en finalizar la compra de los siguientes artículos:\n\n'

    cartItems.forEach(item => {
      const itemPrice = (item.price?.finalPrice || 0) / 100
      const itemTotal = (itemPrice * item.quantity).toFixed(2)
      message += `• ${item.name}  ($${itemTotal})\n`
    })

    const total = cartItems.reduce((sum, item) =>
      sum + ((item.price?.finalPrice || 0) / 100 * item.quantity), 0
    ).toFixed(2)

    message += `\nPrecio Final Total: $${total} USD\n\n`
    message += '¡Gracias!'

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (cartItems.length === 0 && currentStep < 4) return null

  return (
    <div className="min-h-screen bg-darker py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <button
            onClick={() => router.push("/tienda")}
            className="inline-flex items-center text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la Tienda
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-russo text-white mb-2 neon-text">Finalizar Compra</h1>
          <p className="text-gray-400">Completa los pasos para procesar tu orden</p>
        </div>

        <UserSession onLogout={() => setCurrentStep(1)} />

        <div className="mb-12">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep > step.id
                        ? "bg-secondary text-white"
                        : currentStep === step.id
                          ? "bg-primary text-white neon-border-cyan shadow-lg"
                          : "bg-dark border-2 border-light text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-6 h-6" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${currentStep >= step.id ? "text-white" : "text-gray-400"}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 transition-all rounded ${
                      currentStep > step.id ? "bg-secondary" : "bg-dark"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && shouldUseManualFlow && !customer && (
              <EpicIdVerifier onVerified={() => {
                // Track Epic ID confirmed
                if (customerContext?.customer) {
                  trackEpicIdConfirmed(
                    customerContext.customer.epicAccountId,
                    customerContext.customer.displayName || customerContext.customer.epicAccountId
                  )
                  setUserId(customerContext.customer.epicAccountId)
                  setUserProperties({
                    customer_tier: customerContext.customer.tier,
                    has_orders: false,
                  })
                }
              }} />
            )}
            {currentStep === 1 && shouldUseManualFlow && customer && (
              <ManualCheckoutMessage
                manualItems={manualItems}
                customerName={customer.epicAccountId}
                onWhatsAppClick={handleManualCheckoutWhatsApp}
              />
            )}
            {currentStep === 1 && !shouldUseManualFlow && (
              <EpicIdVerifier onVerified={() => {
                // Track Epic ID confirmed
                if (customerContext?.customer) {
                  trackEpicIdConfirmed(
                    customerContext.customer.epicAccountId,
                    customerContext.customer.displayName || customerContext.customer.epicAccountId
                  )
                  setUserId(customerContext.customer.epicAccountId)
                  setUserProperties({
                    customer_tier: customerContext.customer.tier,
                    has_orders: false,
                  })
                }
                setCurrentStep(2)
              }} />
            )}
            {currentStep === 2 && !shouldUseManualFlow && <PaymentMethodSelector selectedMethod={paymentMethod} onSelect={handlePaymentMethodSelect} />}
            {currentStep === 3 && (
              <div className="bg-dark border border-light rounded-lg p-6">
                <h2 className="text-2xl font-russo text-white mb-4">Confirmar Orden</h2>
                <div className="space-y-4 mb-6">
                  {/* Datos del cliente */}
                  <div className="bg-darker rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Datos del Cliente</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Epic ID:</p>
                        <p className="text-white font-medium text-sm">{customer?.displayName || customer?.epicAccountId || "No disponible"}</p>
                        {customer?.displayName && (
                          <p className="text-gray-500 font-mono text-xs mt-0.5">{customer.epicAccountId}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Email:</p>
                        <p className="text-white text-sm">{customer?.email || "No disponible"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400 mb-1">Método de Pago:</p>
                        <p className="text-white text-sm">
                          {getPaymentMethodName(paymentMethod)}
                        </p>
                        {selectedPaymentMethod?.instructions && (
                          <div className="mt-3 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg">
                            <p className="text-xl text-blue-400 mb-2 font-bold flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Instrucciones para realizar el pago
                            </p>
                            <p className="text-base text-white leading-relaxed">{selectedPaymentMethod.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalle de productos */}
                  <div className="bg-darker rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Productos a Comprar</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-dark rounded-lg border border-light">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-sm text-gray-400">Cantidad: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">${((item.price?.finalPrice || 0) / 100).toFixed(2)}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-400">
                                ${(((item.price?.finalPrice || 0) / 100) * item.quantity).toFixed(2)} total
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {orderError && (
                  <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-500">{orderError}</p>
                  </div>
                )}
                <button
                  onClick={handleCreateOrder}
                  disabled={isCreatingOrder}
                  className="w-full py-4 bg-primary hover:bg-secondary text-white font-bold text-lg rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center neon-border-cyan"
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Creando Orden...
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6 mr-2" />
                      Confirmar y Continuar
                    </>
                  )}
                </button>
              </div>
            )}
            {currentStep === 4 && createdOrder && (
              <div className="space-y-6">
                <PaymentUploader
                  orderId={createdOrder.id}
                  orderExpiresAt={createdOrder.expiresAt}
                  paymentMethod={selectedPaymentMethod ? { name: selectedPaymentMethod.name, instructions: selectedPaymentMethod.instructions } : getPaymentMethodName(paymentMethod)}
                  onSuccess={handleUploadSuccess}
                />
                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full py-3 bg-dark hover:bg-light text-white font-bold rounded-lg transition-colors border border-light flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Volver a Revisar Orden
                </button>
              </div>
            )}
            {currentStep > 1 && currentStep < 4 && (
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="flex-1 py-3 bg-dark hover:bg-light text-white font-bold rounded-lg transition-colors border border-light flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Anterior
                </button>
                {currentStep === 2 && paymentMethod && (
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors flex items-center justify-center neon-border-cyan"
                  >
                    Siguiente
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
