"use client"

import { useState, useEffect } from "react"
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

interface PaymentMethod {
  id: string
  slug: string
  name: string
  description?: string
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [createdOrder, setCreatedOrder] = useState<any>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)

  // Detectar si hay items manuales y el feature está habilitado
  const shouldUseManualFlow = manualCheckoutEnabled && hasManualItems()
  const manualItems = cartItems.filter(item => item.requiresManualProcess === true)

  // Debug: Log manual flow detection
  useEffect(() => {
    console.log('🔍 Manual Flow Detection:', {
      manualCheckoutEnabled,
      hasManualItems: hasManualItems(),
      shouldUseManualFlow,
      manualItemsCount: manualItems.length,
      cartItems: cartItems.map(i => ({ name: i.name, requiresManualProcess: i.requiresManualProcess }))
    })
  }, [manualCheckoutEnabled, cartItems, shouldUseManualFlow, manualItems])

  useEffect(() => {
    if (cartItems.length === 0 && currentStep < 4) {
      router.push("/tienda")
    }
  }, [cartItems, router, currentStep])

  // Debug: Log customer data when it changes
  useEffect(() => {
    console.log("Customer in checkout:", customer)
  }, [customer])

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payment-methods?active=true')
        const data = await response.json()
        if (data.success) {
          setPaymentMethods(data.data)
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error)
      }
    }
    fetchPaymentMethods()
  }, [])

  // Get payment method name by slug
  const getPaymentMethodName = (slug: string | null): string => {
    if (!slug) return "No seleccionado"
    const method = paymentMethods.find(m => m.slug === slug)
    return method?.name || slug
  }

  const handleCreateOrder = async () => {
    console.log("🔍 handleCreateOrder called", { customer, paymentMethod, cartTotal, cartItems })

    // Debug: Check if session token exists
    const sessionToken = localStorage.getItem("fortloot_session_token")
    console.log("🔑 Session token:", sessionToken ? "EXISTS" : "MISSING", sessionToken?.substring(0, 20) + "...")

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

      console.log("📊 Cart items:", cartItems)
      console.log("💰 Cart total from API:", cartTotal)

      // Mapear items al formato correcto del backend
      const items = cartItems.map((item) => {
        // Buscar precio calculado desde el backend si existe
        const calculatedPrice = cartTotal?.items?.find((i) => i.itemId === item.id)?.price

        // Obtener precio del backend (ya viene en centavos)
        const itemPriceCents = item.price?.finalPrice || 0
        const itemPriceUSD = itemPriceCents / 100

        console.log(`📦 Item ${item.name}:`, {
          calculatedPrice,
          itemPrice: item.price,
          itemPriceUSD,
          type: item.type
        })

        // Usar precio calculado del backend si existe, sino usar precio del item
        const basePrice = calculatedPrice?.basePrice || itemPriceUSD
        const profitAmount = calculatedPrice?.profitAmount || 0
        const discountAmount = calculatedPrice?.discountAmount || 0
        const finalPrice = calculatedPrice?.finalPrice || itemPriceUSD

        console.log(`💵 Calculated prices for ${item.name}:`, {
          basePrice,
          profitAmount,
          discountAmount,
          finalPrice,
          quantity: item.quantity
        })

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

      console.log("📤 Sending order data:", orderData)
      const response = await orderAPI.create(orderData)
      console.log("✅ Order created:", response)

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
      console.error("❌ Error creating order:", err)
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
    } catch (err) {
      console.error("Error creating tracking order:", err)
      // Continuar de todos modos con WhatsApp
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
              <EpicIdVerifier onVerified={() => {}} />
            )}
            {currentStep === 1 && shouldUseManualFlow && customer && (
              <ManualCheckoutMessage
                manualItems={manualItems}
                customerName={customer.epicAccountId}
                onWhatsAppClick={handleManualCheckoutWhatsApp}
              />
            )}
            {currentStep === 1 && !shouldUseManualFlow && <EpicIdVerifier onVerified={() => setCurrentStep(2)} />}
            {currentStep === 2 && !shouldUseManualFlow && <PaymentMethodSelector selectedMethod={paymentMethod} onSelect={setPaymentMethod} />}
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
                  paymentMethod={getPaymentMethodName(paymentMethod)}
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
