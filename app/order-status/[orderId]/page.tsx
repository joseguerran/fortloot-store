"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { orderAPI, type Order } from "@/lib/api/order"
import { Loader2, CheckCircle, Clock, XCircle, Package, AlertCircle, Home, FileText, ArrowLeft, ShoppingBag, Bitcoin, ExternalLink } from "lucide-react"
import { trackOrderStatusViewed, trackOrderCompleted } from "@/lib/analytics"

interface CryptoPaymentStatus {
  id: string
  status: string
  amount: number
  paidAmount: number | null
  cryptoCurrency: string | null
  network: string | null
  txHash: string | null
  paymentUrl: string
  expiresAt: string
  paidAt: string | null
}

const CRYPTO_STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  PENDING: {
    label: "Esperando Pago",
    color: "yellow",
    description: "Realiza el pago en la pagina de Cryptomus",
  },
  CONFIRMING: {
    label: "Confirmando",
    color: "blue",
    description: "Pago detectado, esperando confirmaciones en la blockchain",
  },
  PAID: {
    label: "Pagado",
    color: "green",
    description: "Pago confirmado exitosamente",
  },
  PAID_OVER: {
    label: "Pagado (exceso)",
    color: "green",
    description: "Pagaste mas del monto requerido",
  },
  WRONG_AMOUNT: {
    label: "Monto Incorrecto",
    color: "red",
    description: "El monto pagado no coincide con el requerido",
  },
  EXPIRED: {
    label: "Expirado",
    color: "red",
    description: "La factura ha expirado",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "red",
    description: "El pago fue cancelado",
  },
  FAILED: {
    label: "Fallido",
    color: "red",
    description: "El pago fallo",
  },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; description: string }> = {
  PENDING: {
    label: "Pendiente",
    color: "gray",
    icon: Clock,
    description: "Tu orden ha sido creada y está esperando procesamiento",
  },
  PENDING_PAYMENT: {
    label: "Esperando Pago",
    color: "yellow",
    icon: Clock,
    description: "Sube tu comprobante de pago para continuar",
  },
  PAYMENT_UPLOADED: {
    label: "Comprobante Subido",
    color: "blue",
    icon: Package,
    description: "Estamos verificando tu comprobante de pago",
  },
  PAYMENT_VERIFIED: {
    label: "Pago Verificado",
    color: "green",
    icon: CheckCircle,
    description: "Tu pago ha sido verificado exitosamente",
  },
  WAITING_FRIENDSHIP: {
    label: "Esperando Amistad",
    color: "blue",
    icon: Clock,
    description: "Esperando que aceptes la solicitud de amistad en Fortnite",
  },
  WAITING_PERIOD: {
    label: "Periodo de Espera 48h",
    color: "blue",
    icon: Clock,
    description: "Epic Games requiere 48 horas antes de poder enviar regalos",
  },
  QUEUED: {
    label: "En Cola",
    color: "blue",
    icon: Package,
    description: "Tu orden está en cola para ser procesada",
  },
  PROCESSING: {
    label: "Enviando Regalo",
    color: "blue",
    icon: Package,
    description: "Estamos enviando tu regalo ahora",
  },
  COMPLETED: {
    label: "Completado",
    color: "green",
    icon: CheckCircle,
    description: "¡Tu regalo ha sido enviado exitosamente!",
  },
  FAILED: {
    label: "Fallido",
    color: "red",
    icon: XCircle,
    description: "Hubo un problema procesando tu orden. Contacta a soporte.",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "red",
    icon: XCircle,
    description: "Esta orden ha sido cancelada",
  },
}

export default function OrderStatusPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromMisCompras = searchParams.get("from") === "mis-compras"
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPaymentStatus | null>(null)
  const statusTracked = useRef<string | null>(null)
  const completedTracked = useRef(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null)
        const identifier = params.orderId as string
        // Detect if it's an orderNumber (FL-xxx) or UUID
        const isOrderNumber = identifier.startsWith("FL-")
        const data = isOrderNumber
          ? await orderAPI.getByOrderNumber(identifier)
          : await orderAPI.getById(identifier)
        setOrder(data)

        // Track order status viewed (only once per status)
        if (data && statusTracked.current !== data.status) {
          statusTracked.current = data.status
          trackOrderStatusViewed(data.orderNumber, data.status)

          // Track order completed (only once)
          if (data.status === "COMPLETED" && !completedTracked.current) {
            completedTracked.current = true
            trackOrderCompleted(data.orderNumber, data.finalPrice || 0)
          }
        }
      } catch (err: any) {
        setError(err.message || "Error cargando la orden")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
    const interval = setInterval(fetchOrder, 30000)

    return () => clearInterval(interval)
  }, [params.orderId])

  // Fetch crypto payment status if order has crypto payment
  useEffect(() => {
    const fetchCryptoStatus = async () => {
      if (!order || order.paymentMethod !== 'CRYPTO') return

      try {
        const response = await fetch(`/api/crypto/status/${order.id}`)
        const data = await response.json()
        if (data.success && data.data) {
          setCryptoPayment(data.data)
        }
      } catch {
        // Silently fail - crypto status is supplementary
      }
    }

    fetchCryptoStatus()
    // Poll more frequently for pending crypto payments
    const cryptoInterval = setInterval(fetchCryptoStatus, 10000)

    return () => clearInterval(cryptoInterval)
  }, [order?.id, order?.paymentMethod])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white">Cargando orden...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Orden No Encontrada</h2>
          <p className="text-gray-400 mb-6">{error || "No pudimos encontrar esta orden"}</p>
          <button onClick={() => router.push("/")} className="px-6 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors">
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
  const StatusIcon = statusConfig.icon

  return (
    <div className="min-h-screen bg-darker py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-dark border border-light rounded-lg p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
              statusConfig.color === "green" ? "bg-green-500/20" :
              statusConfig.color === "blue" ? "bg-blue-500/20" :
              statusConfig.color === "yellow" ? "bg-yellow-500/20" :
              statusConfig.color === "red" ? "bg-red-500/20" : "bg-gray-500/20"
            }`}>
              <StatusIcon className={`w-12 h-12 ${
                statusConfig.color === "green" ? "text-green-500" :
                statusConfig.color === "blue" ? "text-blue-500" :
                statusConfig.color === "yellow" ? "text-yellow-500" :
                statusConfig.color === "red" ? "text-red-500" : "text-gray-500"
              }`} />
            </div>
            <h1 className="text-3xl font-russo text-white mb-2">Orden #{order.orderNumber}</h1>
            <p className={`text-xl font-medium mb-2 ${
              statusConfig.color === "green" ? "text-green-500" :
              statusConfig.color === "blue" ? "text-blue-500" :
              statusConfig.color === "yellow" ? "text-yellow-500" :
              statusConfig.color === "red" ? "text-red-500" : "text-gray-500"
            }`}>
              {statusConfig.label}
            </p>
            <p className="text-gray-400">{statusConfig.description}</p>
          </div>

          <div className="space-y-6">
            {/* Producto(s) de la Orden */}
            <div className="border-t border-light pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Producto(s)</h3>
              <div className="space-y-3">
                {order.orderItems && order.orderItems.length > 0 ? (
                  order.orderItems.map((item: any) => (
                    <div key={item.id} className="bg-darker rounded-lg p-4 border border-light">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <p className="text-white font-bold text-lg mb-1">{item.productName}</p>
                          <p className="text-sm text-gray-400 mb-2">Tipo: {item.productType}</p>
                          <div className="flex items-center gap-4">
                            <p className="text-sm text-gray-400">
                              Cantidad: <span className="text-white font-medium">{item.quantity}</span>
                            </p>
                            <p className="text-sm text-gray-400">
                              Precio unitario: <span className="text-white font-medium">\${item.finalPrice.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400 mb-1">Subtotal</p>
                          <p className="text-white font-bold text-xl">\${(item.finalPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to legacy single product display
                  <div className="bg-darker rounded-lg p-4 border border-light">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <p className="text-white font-bold text-lg mb-1">{order.productName}</p>
                        <p className="text-sm text-gray-400 mb-2">Tipo: {order.productType}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-400">
                            Cantidad: <span className="text-white font-medium">{order.quantity}</span>
                          </p>
                          <p className="text-sm text-gray-400">
                            Precio unitario: <span className="text-white font-medium">\${order.finalPrice.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Total</p>
                        <p className="text-white font-bold text-2xl">\${(order.finalPrice * order.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total General */}
                {order.orderItems && order.orderItems.length > 1 && (
                  <div className="bg-primary/10 border border-primary rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-white font-bold text-lg">Total de la Orden</p>
                      <p className="text-primary font-bold text-2xl">\${order.finalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles de la Orden */}
            <div className="border-t border-light pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Información de la Orden</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-darker rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Epic ID</p>
                  <p className="text-white font-medium text-sm">{order.customer?.displayName || order.customerName || order.customerEpicId}</p>
                  {(order.customer?.epicAccountId || order.customerEpicId) &&
                   (order.customer?.displayName || order.customerName) !== (order.customer?.epicAccountId || order.customerEpicId) && (
                    <p className="text-gray-500 font-mono text-xs mt-0.5">{order.customer?.epicAccountId || order.customerEpicId}</p>
                  )}
                </div>
                <div className="bg-darker rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Fecha de Orden</p>
                  <p className="text-white">{new Date(order.createdAt).toLocaleString("es-AR")}</p>
                </div>
                {order.estimatedDelivery && (
                  <div className="bg-darker rounded-lg p-4 md:col-span-2">
                    <p className="text-sm text-gray-400 mb-1">Entrega Estimada</p>
                    <p className="text-white">{new Date(order.estimatedDelivery).toLocaleString("es-AR")}</p>
                  </div>
                )}
              </div>
            </div>

            {order.status === "PAYMENT_UPLOADED" && (
              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-6">
                <div className="flex gap-4">
                  <Package className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-500 font-bold mb-1">Verificando Comprobante</h4>
                    <p className="text-sm text-blue-400">
                      Tu comprobante está siendo verificado por nuestro equipo. Te notificaremos cuando sea aprobado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Crypto Payment Section */}
            {order.paymentMethod === "CRYPTO" && cryptoPayment && (
              <div className="border-t border-light pt-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Bitcoin className="w-5 h-5 text-green-500" />
                  Pago con Crypto
                </h3>
                <div className="bg-darker rounded-lg p-4 border border-light">
                  {/* Crypto Status Badge */}
                  {(() => {
                    const cryptoConfig = CRYPTO_STATUS_CONFIG[cryptoPayment.status] || CRYPTO_STATUS_CONFIG.PENDING
                    return (
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            cryptoConfig.color === "green" ? "bg-green-500/20 text-green-500" :
                            cryptoConfig.color === "blue" ? "bg-blue-500/20 text-blue-500" :
                            cryptoConfig.color === "yellow" ? "bg-yellow-500/20 text-yellow-500" :
                            cryptoConfig.color === "red" ? "bg-red-500/20 text-red-500" : "bg-gray-500/20 text-gray-500"
                          }`}>
                            {cryptoConfig.label}
                          </span>
                          <p className="text-sm text-gray-400 mt-2">{cryptoConfig.description}</p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Payment Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {cryptoPayment.cryptoCurrency && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Moneda</p>
                        <p className="text-white font-medium">{cryptoPayment.cryptoCurrency}</p>
                      </div>
                    )}
                    {cryptoPayment.network && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Red</p>
                        <p className="text-white font-medium">{cryptoPayment.network}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Monto</p>
                      <p className="text-white font-medium">${cryptoPayment.amount.toFixed(2)} USD</p>
                    </div>
                    {cryptoPayment.paidAmount !== null && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Monto Pagado</p>
                        <p className="text-green-500 font-medium">${cryptoPayment.paidAmount.toFixed(2)} USD</p>
                      </div>
                    )}
                    {cryptoPayment.expiresAt && cryptoPayment.status === "PENDING" && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-400 mb-1">Expira</p>
                        <p className="text-yellow-500 font-medium">
                          {new Date(cryptoPayment.expiresAt).toLocaleString("es-AR")}
                        </p>
                      </div>
                    )}
                    {cryptoPayment.paidAt && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-400 mb-1">Fecha de Pago</p>
                        <p className="text-green-500 font-medium">
                          {new Date(cryptoPayment.paidAt).toLocaleString("es-AR")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Transaction Hash */}
                  {cryptoPayment.txHash && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-1">Hash de Transaccion</p>
                      <p className="text-white font-mono text-xs break-all bg-dark p-2 rounded">
                        {cryptoPayment.txHash}
                      </p>
                    </div>
                  )}

                  {/* Payment Link Button - Only show for pending payments */}
                  {cryptoPayment.status === "PENDING" && cryptoPayment.paymentUrl && (
                    <a
                      href={cryptoPayment.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
                    >
                      <Bitcoin className="w-5 h-5" />
                      Ir a Pagar en Cryptomus
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {order.status === "COMPLETED" && (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-6">
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-green-500 font-bold mb-1">¡Regalo Enviado!</h4>
                    <p className="text-sm text-green-400">
                      Tu regalo ha sido enviado exitosamente. Revisa tu cuenta de Fortnite para reclamar tu item.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {order.status === "FAILED" && order.failureReason && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-500 font-bold mb-1">Error en la Orden</h4>
                    <p className="text-sm text-red-400">{order.failureReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            {fromMisCompras ? (
              <button
                onClick={() => router.push("/mis-compras")}
                className="px-6 py-3 bg-dark hover:bg-light text-white font-bold rounded-lg transition-colors border border-light flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-dark hover:bg-light text-white font-bold rounded-lg transition-colors border border-light flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Volver al Inicio
              </button>
            )}
            {order.status === "COMPLETED" && (
              <button
                onClick={() => router.push("/tienda")}
                className="px-6 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors neon-border-cyan"
              >
                Comprar Más
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
