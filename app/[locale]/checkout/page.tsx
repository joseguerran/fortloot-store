"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/CartContext"
import { useCustomer } from "@/context/CustomerContext"
import { useConfig } from "@/context/ConfigContext"
import { useMaintenance } from "@/context/AnnouncementContext"
import { EpicIdVerifier } from "@/components/checkout/EpicIdVerifier"
import { OrderSummary } from "@/components/checkout/OrderSummary"
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector"
import { PaymentUploader } from "@/components/checkout/PaymentUploader"
import { ManualCheckoutMessage } from "@/components/checkout/ManualCheckoutMessage"
import { UserSession } from "@/components/checkout/UserSession"
import { orderAPI } from "@/lib/api/order"
import { ChevronLeft, ChevronRight, Check, Loader2, ArrowLeft, AlertTriangle } from "lucide-react"
import { trackBeginCheckout, trackEpicIdConfirmed, trackPurchase, setUserId, setUserProperties } from "@/lib/analytics"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

interface PaymentMethod {
  id: string
  slug: string
  name: string
  description?: string
  instructions?: string
}

interface PriceResult {
  originalUsd: number
  finalUsd: number
  convertedAmount?: number
  convertedCurrency?: string
  validUntil?: string
  fees?: { type: string; amount: number; description?: string }[]
}

interface ConversionInfo {
  convertedAmount: number
  convertedCurrency: string
  validUntil: Date
}

export default function CheckoutPage() {
  const t = useTranslations("checkout.page")
  const locale = useLocale()
  const router = useRouter()
  const { cartItems, cartTotal, clearCart, hasManualItems, totalPrice } = useCart()

  const STEPS = [
    { id: 1, name: t("steps.verify"), description: t("steps.verifyDesc") },
    { id: 2, name: t("steps.payment"), description: t("steps.paymentDesc") },
    { id: 3, name: t("steps.review"), description: t("steps.reviewDesc") },
    { id: 4, name: t("steps.upload"), description: t("steps.uploadDesc") },
  ]
  const { manualCheckoutEnabled } = useConfig()
  const { isInMaintenance, maintenanceMessage } = useMaintenance()
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

  // Currency conversion and fees state
  const [conversionInfo, setConversionInfo] = useState<ConversionInfo | null>(null)
  const [isLoadingConversion, setIsLoadingConversion] = useState(false)
  const [conversionError, setConversionError] = useState(false)
  const [feeInfo, setFeeInfo] = useState<{ type: string; amount: number; description?: string }[] | null>(null)
  const [finalPrice, setFinalPrice] = useState<number | null>(null)

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
      router.push(`/${locale}/store`)
    }
  }, [cartItems, router, currentStep, locale])

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
  const handlePaymentMethodSelect = async (slug: string) => {
    setPaymentMethod(slug)
    const method = paymentMethods.find(m => m.slug === slug)
    setSelectedPaymentMethod(method || null)

    // Reset price adjustment state
    setConversionInfo(null)
    setConversionError(false)
    setFeeInfo(null)
    setFinalPrice(null)

    // Methods that require currency conversion (show error if fails)
    const methodsWithConversion = ['pagomovil']
    const requiresConversion = methodsWithConversion.includes(slug)

    // Fetch price adjustments for this payment method (fees, conversion, etc.)
    if (method && totalPrice > 0) {
      setIsLoadingConversion(true)
      try {
        const response = await fetch(`/api/payment-methods/${method.id}/price?priceUsd=${totalPrice}`)
        const data = await response.json()

        if (data.success && data.data) {
          const priceResult: PriceResult = data.data

          // Set final price if different from original
          if (priceResult.finalUsd !== priceResult.originalUsd) {
            setFinalPrice(priceResult.finalUsd)
          }

          // Set fees if present
          if (priceResult.fees && priceResult.fees.length > 0) {
            setFeeInfo(priceResult.fees)
          }

          // Set conversion info if present
          if (priceResult.convertedAmount && priceResult.convertedCurrency) {
            setConversionInfo({
              convertedAmount: priceResult.convertedAmount,
              convertedCurrency: priceResult.convertedCurrency,
              validUntil: priceResult.validUntil ? new Date(priceResult.validUntil) : new Date(),
            })
          } else if (requiresConversion) {
            // Method requires conversion but none was returned (API/rate failure)
            setConversionError(true)
          }
        } else if (requiresConversion) {
          // API returned error and method requires conversion
          setConversionError(true)
        }
      } catch {
        // Network error
        if (requiresConversion) {
          setConversionError(true)
        }
      } finally {
        setIsLoadingConversion(false)
      }
    }
  }

  // Get payment method name by slug
  const getPaymentMethodName = (slug: string | null): string => {
    if (!slug) return t("notSelected")
    if (slug === 'crypto') return t("cryptoPayment")
    const method = paymentMethods.find(m => m.slug === slug)
    return method?.name || slug
  }

  const handleCreateOrder = async () => {
    if (!customer || !paymentMethod) {
      setOrderError(t("errors.missingInfo"))
      return
    }

    if (cartItems.length === 0) {
      setOrderError(t("errors.emptyCart"))
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
        locale: locale as 'es' | 'en',
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

      // If crypto payment, create invoice and redirect
      if (paymentMethod === 'crypto') {
        try {
          const cryptoResponse = await fetch('/api/crypto/create-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: response.orderId }),
          })
          const cryptoData = await cryptoResponse.json()

          if (cryptoData.success && cryptoData.data?.paymentUrl) {
            // Clear cart before redirecting
            clearCart()
            // Redirect to Cryptomus payment page
            window.location.href = cryptoData.data.paymentUrl
            return
          } else {
            throw new Error(cryptoData.message || t("errors.cryptoInvoiceError"))
          }
        } catch (cryptoErr: any) {
          setOrderError(cryptoErr.message || t("errors.cryptoProcessError"))
          setIsCreatingOrder(false)
          return
        }
      }

      // For manual payment methods, go to step 4 (upload proof)
      setCreatedOrder({
        id: response.orderId,
        orderNumber: response.orderNumber,
        status: response.status,
        totalAmount: response.totalAmount,
        expiresAt: response.expiresAt
      } as any)
      setCurrentStep(4)
    } catch (err: any) {
      setOrderError(err.message || t("errors.orderCreationError"))
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const handleUploadSuccess = () => {
    clearCart()
    router.push(`/${locale}/order-status/${createdOrder.id}`)
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
        locale: locale as 'es' | 'en',
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

  // Fallback WhatsApp when currency conversion fails (e.g., Pago Móvil without rate)
  const handleConversionFallbackWhatsApp = async () => {
    if (!customer) return

    const whatsappNumber = "5491169755444"

    let message = `Hola! Quiero completar mi compra con ${selectedPaymentMethod?.name || 'Pago Movil'}:\n\n`
    message += `Epic ID: ${customer.epicAccountId}\n`
    message += `Email: ${customer.email || 'No especificado'}\n\n`
    message += `Productos:\n`

    cartItems.forEach(item => {
      const itemPrice = (item.price?.finalPrice || 0) / 100
      const itemTotal = (itemPrice * item.quantity).toFixed(2)
      message += `• ${item.name} ($${itemTotal})\n`
    })

    const total = cartItems.reduce((sum, item) =>
      sum + ((item.price?.finalPrice || 0) / 100 * item.quantity), 0
    ).toFixed(2)

    message += `\nTotal USD: $${total}\n\n`
    message += `Por favor, indiquenme el monto en Bolivares para realizar el pago.\n\n`
    message += `Gracias!`

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (cartItems.length === 0 && currentStep < 4) return null

  // Show maintenance block when in maintenance mode
  if (isInMaintenance) {
    return (
      <div className="min-h-screen bg-darker py-12 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-amber-500/10 border-2 border-amber-500 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-16 h-16 text-amber-500" />
              </div>
            </div>
            <h1 className="text-3xl font-russo text-amber-500 mb-4">
              {maintenanceMessage?.title || t("maintenance.title")}
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              {maintenanceMessage?.message || t("maintenance.message")}
            </p>
            <p className="text-sm text-gray-400 mb-8">
              {t("maintenance.disabled")}
            </p>
            <button
              onClick={() => router.push(`/${locale}/store`)}
              className="inline-flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("backToStore")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-darker py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${locale}/store`)}
            className="inline-flex items-center text-secondary hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("backToStore")}
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-russo text-white mb-2 neon-text">{t("title")}</h1>
          <p className="text-gray-400">{t("subtitle")}</p>
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
                <h2 className="text-2xl font-russo text-white mb-4">{t("confirmOrder.title")}</h2>
                <div className="space-y-4 mb-6">
                  {/* Datos del cliente */}
                  <div className="bg-darker rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">{t("confirmOrder.customerData")}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t("confirmOrder.epicId")}:</p>
                        <p className="text-white font-medium text-sm">{customer?.displayName || customer?.epicAccountId || t("confirmOrder.notAvailable")}</p>
                        {customer?.displayName && (
                          <p className="text-gray-500 font-mono text-xs mt-0.5">{customer.epicAccountId}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{t("confirmOrder.email")}:</p>
                        <p className="text-white text-sm">{customer?.email || t("confirmOrder.notAvailable")}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400 mb-1">{t("confirmOrder.paymentMethod")}:</p>
                        <p className="text-white text-sm">
                          {getPaymentMethodName(paymentMethod)}
                        </p>
                        {/* Mostrar error de conversión en lugar de instrucciones */}
                        {conversionError ? (
                          <div className="mt-3 p-4 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-lg">
                            <p className="text-lg text-amber-400 mb-2 font-bold flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {t("confirmOrder.conversionError")}
                            </p>
                            <p className="text-base text-amber-200/80 mb-4">
                              {t("confirmOrder.conversionErrorMessage")}
                            </p>
                            <button
                              onClick={handleConversionFallbackWhatsApp}
                              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              {t("confirmOrder.whatsappInstructions")}
                            </button>
                          </div>
                        ) : selectedPaymentMethod?.instructions && (
                          <div className="mt-3 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg">
                            <p className="text-xl text-blue-400 mb-2 font-bold flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              {t("confirmOrder.paymentInstructions")}
                            </p>
                            <p className="text-base text-white leading-relaxed">{selectedPaymentMethod.instructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalle de productos */}
                  <div className="bg-darker rounded-lg p-4">
                    <h3 className="text-lg font-bold text-white mb-3">{t("confirmOrder.products")}</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-dark rounded-lg border border-light">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-sm text-gray-400">{t("confirmOrder.quantity")}: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">${((item.price?.finalPrice || 0) / 100).toFixed(2)}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-400">
                                ${(((item.price?.finalPrice || 0) / 100) * item.quantity).toFixed(2)} {t("confirmOrder.total")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desglose de comisiones (si aplica) */}
                  {feeInfo && feeInfo.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <p className="text-amber-300 font-medium mb-2">{t("confirmOrder.priceBreakdown")}:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">{t("confirmOrder.subtotal")}:</span>
                          <span className="text-white">${totalPrice.toFixed(2)}</span>
                        </div>
                        {feeInfo.map((fee, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-300">
                              {fee.description || t("confirmOrder.fee")}:
                            </span>
                            <span className="text-amber-400">+${fee.amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-amber-500/30 pt-2 mt-2">
                          <span className="text-white font-medium">{t("confirmOrder.totalToPay")}:</span>
                          <span className="text-xl font-bold text-amber-400">${finalPrice?.toFixed(2) || totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Precio convertido (si aplica) */}
                  {conversionInfo && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-300 font-medium">{t("confirmOrder.totalToPay")}:</span>
                        <span className="text-2xl font-bold text-blue-400">
                          {conversionInfo.convertedAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })} {conversionInfo.convertedCurrency === 'VES' ? 'Bs' : conversionInfo.convertedCurrency}
                        </span>
                      </div>
                      {conversionInfo.validUntil && (
                        <p className="text-xs text-blue-300/70 mt-2">
                          {t("confirmOrder.priceValidUntil", { time: new Date(conversionInfo.validUntil).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', hour12: true }) })}
                        </p>
                      )}
                    </div>
                  )}
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
                      {t("confirmOrder.creating")}
                    </>
                  ) : (
                    <>
                      <Check className="w-6 h-6 mr-2" />
                      {t("confirmOrder.confirmAndContinue")}
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
                  {t("backToReview")}
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
                  {t("previous")}
                </button>
                {currentStep === 2 && paymentMethod && (
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors flex items-center justify-center neon-border-cyan"
                  >
                    {t("next")}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummary
                conversionInfo={conversionInfo}
                isLoadingConversion={isLoadingConversion}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
