"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Loader2, Mail, Gamepad2 } from "lucide-react"
import { useCustomer } from "@/context/CustomerContext"
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { IMAGES } from "@/config/images"

// Order components
import { OrderFilters, type OrderStatusFilter, type DateRangeFilter, filterOrdersByStatus, filterOrdersByDate } from "@/components/orders/OrderFilters"
import { OrderCard } from "@/components/orders/OrderCard"
import { EmptyOrders } from "@/components/orders/EmptyOrders"

type Step = "loading" | "epic-id" | "otp" | "orders"
type ContactMethod = "EMAIL" | "WHATSAPP"

interface OrderItem {
  id: string
  quantity: number
  priceAtPurchase: number
  catalogItem: {
    id: string
    name: string
    image: string
    type: string
    rarity?: string
  } | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  completedAt: string | null
  items: OrderItem[]
}

interface Customer {
  id: string
  epicAccountId: string
  displayName?: string
  email?: string
  phoneNumber?: string
  contactPreference: ContactMethod
  tier: string
  totalOrders: number
  totalSpent: number
}

export default function MisComprasPage() {
  const { customer: contextCustomer, setSessionFromOTP, logout: contextLogout } = useCustomer() || {}
  const [step, setStep] = useState<Step>("loading")
  const [displayName, setDisplayName] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null)
  const [maskedContact, setMaskedContact] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  // Filter states
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all")
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all")

  // Load customer from context on mount
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        // Try to load from context (session is in httpOnly cookie)
        if (contextCustomer?.id) {
          setCustomer(contextCustomer as Customer)
          await loadOrders(contextCustomer.id)
          setStep("orders")
          return
        }

        // No customer in context, show Epic ID form
        setStep("epic-id")
      } catch {
        setStep("epic-id")
      }
    }

    loadCustomer()
  }, [contextCustomer])

  const loadOrders = async (customerId: string) => {
    try {
      const response = await fetch(`/api/otp/orders/${customerId}`)
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch {
      // Silently fail - orders list will remain empty
    }
  }

  const handleRequestOTP = async () => {
    if (!displayName.trim()) {
      setError("Ingresa tu nombre de usuario de Fortnite")
      return
    }

    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/otp/request-by-epic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || "Error al enviar el codigo")
        return
      }

      setMessage(data.message)
      setContactMethod(data.contactMethod)
      setMaskedContact(data.maskedContact)
      setStep("otp")
    } catch {
      setError("No pudimos conectar con el servidor. Verifica tu conexion e intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Ingresa el codigo de 6 digitos")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/otp/verify-by-epic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for session
        body: JSON.stringify({ displayName: displayName.trim(), code: otpCode }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || "Codigo invalido")
        return
      }

      setCustomer(data.customer)

      // Sync with CustomerContext (session cookie was set by the API)
      if (setSessionFromOTP) {
        setSessionFromOTP(data.customer)
      }

      // Cargar ordenes
      await loadOrders(data.customer.id)

      setStep("orders")
    } catch {
      setError("No pudimos conectar con el servidor. Verifica tu conexion e intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setOtpCode("")
    await handleRequestOTP()
  }

  const handleLogout = async () => {
    // Clear session via context (calls logout API to clear httpOnly cookie)
    if (contextLogout) {
      await contextLogout()
    }

    // Reset local state
    setStep("epic-id")
    setDisplayName("")
    setOtpCode("")
    setCustomer(null)
    setOrders([])
    setContactMethod(null)
    setMaskedContact(null)
    setStatusFilter("all")
    setDateFilter("all")
  }

  const handleClearFilters = () => {
    setStatusFilter("all")
    setDateFilter("all")
  }

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders
    result = filterOrdersByStatus(result, statusFilter)
    result = filterOrdersByDate(result, dateFilter)
    return result
  }, [orders, statusFilter, dateFilter])

  const hasActiveFilters = statusFilter !== "all" || dateFilter !== "all"

  // Loading state - same as store
  if (step === "loading") {
    return (
      <div className="min-h-screen text-white relative">
        {/* Spacer for fixed header */}
        <div className="h-32"></div>

        {/* Background */}
        <div className="fixed inset-0 z-0">
          <OptimizedImage
            src={IMAGES.NEON_GAMING_NEW}
            alt="Gaming Background"
            fill
            className="object-cover blur-[4px] brightness-[0.7]"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        <div className="relative z-20 flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Spacer for fixed header */}
      <div className="h-32"></div>

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <OptimizedImage
          src={IMAGES.NEON_GAMING_NEW}
          alt="Gaming Background"
          fill
          className="object-cover blur-[4px] brightness-[0.7]"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-20">
        <main className="container mx-auto px-4 py-8 pt-16">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-['Russo_One'] mb-2 relative inline-block">
              <span className="text-white">
                Mis <span className="text-primary neon-text">Compras</span>
              </span>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100px" }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="h-1 bg-primary mx-auto mt-2"
              />
            </h1>
          </motion.div>

          {/* User badge - below title */}
          {customer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-3 bg-[#0D1B2A]/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-[#00F5D4] shadow-[0_0_15px_rgba(0,245,212,0.3),inset_0_0_15px_rgba(0,245,212,0.1)]">
                <div className="w-8 h-8 rounded-full bg-[#00F5D4]/20 flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-[#00F5D4]" />
                </div>
                <span className="text-[#00F5D4] font-medium">{customer.displayName || customer.epicAccountId}</span>
                <div className="w-px h-5 bg-[#00F5D4]/30"></div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-[#FF007A] transition-colors"
                >
                  Cambiar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step: Epic ID Input */}
          {step === "epic-id" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-[#1B263B]/70 backdrop-blur-sm rounded-xl border border-[#1B263B]/80 p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-2">Accede a tu historial</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Ingresa tu nombre de usuario de Fortnite para ver tus compras
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Nombre de usuario de Fortnite
                    </label>
                    <div className="relative">
                      <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Ej: MiNombre123"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#0D1B2A] text-white border border-[#1B263B] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-[#00F5D4] transition-colors"
                        onKeyDown={(e) => e.key === "Enter" && handleRequestOTP()}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Es el mismo nombre de usuario que usaste para realizar tus compras
                    </p>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>
                  )}

                  <button
                    onClick={handleRequestOTP}
                    disabled={isLoading}
                    className="w-full bg-[#FF007A] hover:bg-[#FF007A]/90 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-lg shadow-[#FF007A]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Continuar
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Te enviaremos un codigo de verificacion a tu medio de contacto registrado
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: OTP Verification */}
          {step === "otp" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-[#1B263B]/70 backdrop-blur-sm rounded-xl border border-[#1B263B]/80 p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-2">Ingresa el codigo</h2>
                <p className="text-gray-400 text-sm mb-6">
                  {message || "Te enviamos un codigo de verificacion"}
                </p>

                <div className="space-y-4">
                  {/* Contact method indicator */}
                  {contactMethod && (
                    <div className="flex items-center gap-2 p-3 bg-[#0D1B2A] rounded-lg">
                      {contactMethod === "EMAIL" ? (
                        <Mail className="h-5 w-5 text-blue-400" />
                      ) : (
                        <WhatsAppIcon className="h-5 w-5 text-green-400" />
                      )}
                      <span className="text-sm text-gray-300">
                        Codigo enviado a {maskedContact}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Codigo de verificacion
                    </label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full bg-[#0D1B2A] text-white border border-[#1B263B] rounded-lg py-3 px-4 text-center text-2xl tracking-widest focus:outline-none focus:border-[#00F5D4] transition-colors"
                      maxLength={6}
                      onKeyDown={(e) => e.key === "Enter" && otpCode.length === 6 && handleVerifyOTP()}
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>
                  )}

                  <button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full bg-[#FF007A] hover:bg-[#FF007A]/90 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-lg shadow-[#FF007A]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verificar Codigo
                  </button>

                  <div className="flex justify-between items-center text-sm">
                    <button
                      onClick={() => {
                        setStep("epic-id")
                        setOtpCode("")
                        setError(null)
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Cambiar usuario
                    </button>
                    <button
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-[#FF007A] hover:text-[#FF007A]/80 transition-colors"
                    >
                      Reenviar codigo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Orders List */}
          {step === "orders" && customer && (
            <div className="space-y-6">
              {/* Filters */}
              <OrderFilters
                activeStatus={statusFilter}
                onStatusChange={setStatusFilter}
                dateRange={dateFilter}
                onDateRangeChange={setDateFilter}
              />

              {/* Orders */}
              {filteredOrders.length === 0 ? (
                <EmptyOrders
                  hasFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <div className="grid gap-4">
                  {filteredOrders.map((order, index) => (
                    <OrderCard key={order.id} order={order} index={index} />
                  ))}
                </div>
              )}

              {/* Stats card */}
              {orders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-[#1B263B]/70 backdrop-blur-sm rounded-xl border border-[#1B263B]/80 p-4 md:p-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#00F5D4]">{customer.totalOrders}</p>
                      <p className="text-xs text-gray-400">Total Ordenes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#FF007A]">
                        {orders.filter((o) => o.status === "COMPLETED").length}
                      </p>
                      <p className="text-xs text-gray-400">Completadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        {orders.filter((o) => ["PENDING", "PAYMENT_PENDING", "PAID", "VERIFYING_EPIC", "FRIENDSHIP_PENDING", "GIFTING"].includes(o.status)).length}
                      </p>
                      <p className="text-xs text-gray-400">En Proceso</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#C1FF00]">{customer.tier}</p>
                      <p className="text-xs text-gray-400">Tu Nivel</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
