"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { orderAPI, type Order } from "@/lib/api/order"
import { Loader2, CheckCircle, Clock, XCircle, Package, AlertCircle, Home, FileText, ArrowLeft, ShoppingBag, ExternalLink, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { trackOrderStatusViewed, trackOrderCompleted } from "@/lib/analytics"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

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

const CRYPTO_STATUS_CONFIG: Record<string, { key: string; color: string }> = {
  PENDING: { key: "pending", color: "yellow" },
  CONFIRMING: { key: "confirming", color: "blue" },
  PAID: { key: "paid", color: "green" },
  PAID_OVER: { key: "paidOver", color: "green" },
  WRONG_AMOUNT: { key: "wrongAmount", color: "red" },
  EXPIRED: { key: "expired", color: "red" },
  CANCELLED: { key: "cancelled", color: "red" },
  FAILED: { key: "failed", color: "red" },
}

const STATUS_CONFIG: Record<string, { key: string; color: string; icon: any }> = {
  PENDING: { key: "pending", color: "gray", icon: Clock },
  PENDING_PAYMENT: { key: "pendingPayment", color: "yellow", icon: Clock },
  PAYMENT_UPLOADED: { key: "paymentUploaded", color: "blue", icon: Package },
  PAYMENT_VERIFIED: { key: "paymentVerified", color: "green", icon: CheckCircle },
  WAITING_FRIENDSHIP: { key: "waitingFriendship", color: "blue", icon: Clock },
  WAITING_PERIOD: { key: "waitingPeriod", color: "blue", icon: Clock },
  QUEUED: { key: "queued", color: "blue", icon: Package },
  PROCESSING: { key: "processing", color: "blue", icon: Package },
  COMPLETED: { key: "completed", color: "green", icon: CheckCircle },
  FAILED: { key: "failed", color: "red", icon: XCircle },
  CANCELLED: { key: "cancelled", color: "red", icon: XCircle },
  PAYMENT_REJECTED: { key: "paymentRejected", color: "red", icon: XCircle },
  EXPIRED: { key: "expired", color: "gray", icon: Clock },
  ABANDONED: { key: "abandoned", color: "gray", icon: Clock },
  REFUNDED: { key: "refunded", color: "yellow", icon: CheckCircle },
}

export default function OrderStatusPage() {
  const t = useTranslations("orders")
  const tStatus = useTranslations("orders.status")
  const tDesc = useTranslations("orders.statusDescriptions")
  const tCrypto = useTranslations("orders.crypto")
  const tCryptoStatus = useTranslations("orders.crypto.status")
  const locale = useLocale()
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromMisCompras = searchParams.get("from") === "my-orders"
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPaymentStatus | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
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
        setError(err.message || t("detail.loadError"))
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

  const handleRegeneratePayment = async () => {
    if (!order || isRegenerating) return

    setIsRegenerating(true)
    try {
      const response = await fetch(`/api/crypto/regenerate/${order.id}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success && data.data?.paymentUrl) {
        // Update local crypto payment state
        setCryptoPayment(prev => prev ? {
          ...prev,
          paymentUrl: data.data.paymentUrl,
          expiresAt: data.data.expiresAt,
          id: data.data.cryptoPaymentId,
          status: 'PENDING',
          cryptoCurrency: null,
          network: null,
          txHash: null,
          paidAmount: null,
          paidAt: null,
        } : null)

        // Open new payment URL
        window.open(data.data.paymentUrl, '_blank')
        toast.success(tCrypto('regenerated'))
      } else {
        toast.error(data.message || tCrypto('regenerateError'))
      }
    } catch {
      toast.error(tCrypto('regenerateError'))
    } finally {
      setIsRegenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white">{t("detail.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-darker flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{t("detail.notFound")}</h2>
          <p className="text-gray-400 mb-6">{error || t("detail.notFoundDesc")}</p>
          <button onClick={() => router.push(`/${locale}`)} className="px-6 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors">
            {t("detail.backToHome")}
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
            <h1 className="text-3xl font-russo text-white mb-2">{t("history.order")} #{order.orderNumber}</h1>
            <p className={`text-xl font-medium mb-2 ${
              statusConfig.color === "green" ? "text-green-500" :
              statusConfig.color === "blue" ? "text-blue-500" :
              statusConfig.color === "yellow" ? "text-yellow-500" :
              statusConfig.color === "red" ? "text-red-500" : "text-gray-500"
            }`}>
              {tStatus(statusConfig.key)}
            </p>
            <p className="text-gray-400">{tDesc(statusConfig.key)}</p>
          </div>

          <div className="space-y-6">
            {/* Producto(s) de la Orden */}
            <div className="border-t border-light pt-6">
              <h3 className="text-xl font-bold text-white mb-4">{t("statusPage.products")}</h3>
              <div className="space-y-3">
                {order.orderItems && order.orderItems.length > 0 ? (
                  order.orderItems.map((item: any) => (
                    <div key={item.id} className="bg-darker rounded-lg p-4 border border-light">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <p className="text-white font-bold text-lg mb-1">{item.productName}</p>
                          <p className="text-sm text-gray-400 mb-2">{t("statusPage.type")}: {item.productType}</p>
                          <div className="flex items-center gap-4">
                            <p className="text-sm text-gray-400">
                              {t("statusPage.quantity")}: <span className="text-white font-medium">{item.quantity}</span>
                            </p>
                            <p className="text-sm text-gray-400">
                              {t("statusPage.unitPrice")}: <span className="text-white font-medium">\${item.finalPrice.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400 mb-1">{t("detail.subtotal")}</p>
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
                        <p className="text-sm text-gray-400 mb-2">{t("statusPage.type")}: {order.productType}</p>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-400">
                            {t("statusPage.quantity")}: <span className="text-white font-medium">{order.quantity}</span>
                          </p>
                          <p className="text-sm text-gray-400">
                            {t("statusPage.unitPrice")}: <span className="text-white font-medium">\${order.finalPrice.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">{t("detail.total")}</p>
                        <p className="text-white font-bold text-2xl">\${(order.finalPrice * order.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total General */}
                {order.orderItems && order.orderItems.length > 1 && (
                  <div className="bg-primary/10 border border-primary rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <p className="text-white font-bold text-lg">{t("statusPage.orderTotal")}</p>
                      <p className="text-primary font-bold text-2xl">\${order.finalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles de la Orden */}
            <div className="border-t border-light pt-6">
              <h3 className="text-xl font-bold text-white mb-4">{t("statusPage.orderInfo")}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-darker rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">{t("statusPage.epicId")}</p>
                  <p className="text-white font-medium text-sm">{order.customer?.displayName || order.customerName || order.customerEpicId}</p>
                  {(order.customer?.epicAccountId || order.customerEpicId) &&
                   (order.customer?.displayName || order.customerName) !== (order.customer?.epicAccountId || order.customerEpicId) && (
                    <p className="text-gray-500 font-mono text-xs mt-0.5">{order.customer?.epicAccountId || order.customerEpicId}</p>
                  )}
                </div>
                <div className="bg-darker rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">{t("statusPage.orderDate")}</p>
                  <p className="text-white">{new Date(order.createdAt).toLocaleString(locale)}</p>
                </div>
                {order.estimatedDelivery && (
                  <div className="bg-darker rounded-lg p-4 md:col-span-2">
                    <p className="text-sm text-gray-400 mb-1">{t("statusPage.estimatedDelivery")}</p>
                    <p className="text-white">{new Date(order.estimatedDelivery).toLocaleString(locale)}</p>
                  </div>
                )}
              </div>
            </div>

            {order.status === "PAYMENT_UPLOADED" && (
              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-6">
                <div className="flex gap-4">
                  <Package className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-500 font-bold mb-1">{t("statusPage.verifyingProof")}</h4>
                    <p className="text-sm text-blue-400">
                      {t("statusPage.verifyingProofDesc")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Crypto Payment Section - Only show for active orders */}
            {order.paymentMethod === "CRYPTO" &&
             cryptoPayment &&
             !["CANCELLED", "FAILED", "EXPIRED", "ABANDONED", "REFUNDED", "PAYMENT_REJECTED"].includes(order.status) && (
              <div className="border-t border-light pt-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {tCrypto("paymentDetail")}
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
                            {tCryptoStatus(cryptoConfig.key)}
                          </span>
                          <p className="text-sm text-gray-400 mt-2">{tCryptoStatus(`${cryptoConfig.key}Desc`)}</p>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Payment Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {cryptoPayment.cryptoCurrency && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{tCrypto("currency")}</p>
                        <p className="text-white font-medium">{cryptoPayment.cryptoCurrency}</p>
                      </div>
                    )}
                    {cryptoPayment.network && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{tCrypto("network")}</p>
                        <p className="text-white font-medium">{cryptoPayment.network}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{tCrypto("amount")}</p>
                      <p className="text-white font-medium">${cryptoPayment.amount.toFixed(2)} USD</p>
                    </div>
                    {cryptoPayment.paidAmount !== null && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">{tCrypto("paidAmount")}</p>
                        <p className="text-green-500 font-medium">
                          {cryptoPayment.paidAmount.toFixed(2)} {cryptoPayment.cryptoCurrency || 'CRYPTO'}
                        </p>
                      </div>
                    )}
                    {cryptoPayment.expiresAt && cryptoPayment.status === "PENDING" && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-400 mb-1">{tCrypto("expires")}</p>
                        <p className="text-yellow-500 font-medium">
                          {new Date(cryptoPayment.expiresAt).toLocaleString(locale)}
                        </p>
                      </div>
                    )}
                    {cryptoPayment.paidAt && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-400 mb-1">{tCrypto("paidAt")}</p>
                        <p className="text-green-500 font-medium">
                          {new Date(cryptoPayment.paidAt).toLocaleString(locale)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Transaction Hash */}
                  {cryptoPayment.txHash && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-1">{tCrypto("txHash")}</p>
                      <p className="text-white font-mono text-xs break-all bg-dark p-2 rounded">
                        {cryptoPayment.txHash}
                      </p>
                    </div>
                  )}

                  {/* Payment Actions - Only show for pending payments AND active orders */}
                  {cryptoPayment.status === "PENDING" &&
                   cryptoPayment.paymentUrl &&
                   !["CANCELLED", "FAILED", "EXPIRED", "ABANDONED", "REFUNDED", "PAYMENT_REJECTED"].includes(order.status) && (
                    <div className="space-y-3">
                      <a
                        href={cryptoPayment.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors"
                      >
                        {tCrypto("goToPay")}
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        onClick={handleRegeneratePayment}
                        disabled={isRegenerating}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-dark hover:bg-light text-white font-medium rounded-lg transition-colors border border-light disabled:opacity-50"
                      >
                        {isRegenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {tCrypto("regenerating")}
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            {tCrypto("changeCurrency")}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {order.status === "COMPLETED" && (
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-6">
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-green-500 font-bold mb-1">{t("statusPage.giftSent")}</h4>
                    <p className="text-sm text-green-400">
                      {t("statusPage.giftSentDesc")}
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
                    <h4 className="text-red-500 font-bold mb-1">{t("statusPage.orderError")}</h4>
                    <p className="text-sm text-red-400">{order.failureReason}</p>
                  </div>
                </div>
              </div>
            )}

            {(order.status === "CANCELLED" || order.status === "EXPIRED" || order.status === "ABANDONED") && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
                <div className="flex gap-4">
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-500 font-bold mb-1">{t("statusPage.orderNotCompleted")}</h4>
                    <p className="text-sm text-red-400">
                      {order.status === "CANCELLED" && t("statusPage.cancelledMessage")}
                      {order.status === "EXPIRED" && t("statusPage.expiredMessage")}
                      {order.status === "ABANDONED" && t("statusPage.abandonedMessage")}
                      {" "}{t("statusPage.contactSupport")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            {fromMisCompras ? (
              <button
                onClick={() => router.push(`/${locale}/my-orders`)}
                className="px-6 py-3 bg-dark hover:bg-light text-white font-bold rounded-lg transition-colors border border-light flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("statusPage.back")}
              </button>
            ) : (
              <button
                onClick={() => router.push(`/${locale}`)}
                className="px-6 py-3 bg-dark hover:bg-light text-white font-bold rounded-lg transition-colors border border-light flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                {t("detail.backToHome")}
              </button>
            )}
            {order.status === "COMPLETED" && (
              <button
                onClick={() => router.push(`/${locale}/store`)}
                className="px-6 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors neon-border-cyan"
              >
                {t("statusPage.buyMore")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
