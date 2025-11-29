"use client"

import { useState, useCallback } from "react"
import { Check, Loader2, AlertCircle, Copy, X, Mail } from "lucide-react"
import { useCustomer } from "@/context/CustomerContext"
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon"
import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"
import { customerAPI } from "@/lib/api/customer"

interface EpicIdVerifierProps {
  onVerified: () => void
}

interface AvailableBot {
  epicId: string
  displayName: string
}

type ContactPreference = 'WHATSAPP' | 'EMAIL'

/**
 * Normaliza un número de teléfono para el formato esperado por el backend
 * Ejemplo: "+56 9 1234 5678" -> "56912345678"
 */
function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[\s\-\+\(\)]/g, '')
}

export function EpicIdVerifier({ onVerified }: EpicIdVerifierProps) {
  const router = useRouter()
  const customerContext = useCustomer()
  const { cartItems, removeFromCart } = useCart()
  const [epicId, setEpicId] = useState("")
  const [contactPreference, setContactPreference] = useState<ContactPreference>('WHATSAPP')
  const [contactValue, setContactValue] = useState("")
  const [localError, setLocalError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [availableBots, setAvailableBots] = useState<AvailableBot[]>([])
  const [copiedBotId, setCopiedBotId] = useState<string | null>(null)
  const [showNoBotsModal, setShowNoBotsModal] = useState(false)
  const [submittedEpicId, setSubmittedEpicId] = useState("")
  const [isVerifyingFriendships, setIsVerifyingFriendships] = useState(false)

  // Verificar si hay items de la tienda que requieren bots
  // Items que requieren bots: outfit, emote, pickaxe, glider, backpack, wrap
  const STORE_TYPES = ['outfit', 'emote', 'pickaxe', 'glider', 'backpack', 'wrap']
  const storeItems = cartItems.filter(item => STORE_TYPES.includes(item.type))
  const nonStoreItems = cartItems.filter(item => !STORE_TYPES.includes(item.type))

  // Verificar que el contexto esté disponible
  if (!customerContext) {
    return (
      <div className="bg-dark border border-light rounded-lg p-6">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  const { customer, createSession, isLoading, error, logout } = customerContext

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError("")
    setAvailableBots([])

    if (!epicId.trim()) {
      setLocalError("Por favor ingresa tu Epic ID")
      return
    }

    if (!contactValue.trim()) {
      setLocalError(contactPreference === 'WHATSAPP'
        ? "Por favor ingresa tu número de WhatsApp"
        : "Por favor ingresa tu email")
      return
    }

    // Validar formato según preferencia
    if (contactPreference === 'EMAIL' && !contactValue.includes("@")) {
      setLocalError("Por favor ingresa un email válido")
      return
    }

    if (contactPreference === 'WHATSAPP') {
      // Validar que sea un número de teléfono básico
      const phoneRegex = /^\+?[0-9\s-]{8,20}$/
      if (!phoneRegex.test(contactValue.replace(/\s/g, ''))) {
        setLocalError("Por favor ingresa un número de WhatsApp válido (ej: +56912345678)")
        return
      }
    }

    if (!createSession) {
      setLocalError("Error: Sistema no disponible")
      return
    }

    // Si solo hay items que NO son de la tienda (vbucks, crew, bundle),
    // no necesitamos verificar friendships con bots
    const hasStoreItems = storeItems.length > 0

    try {
      // Pasar la información del carrito al backend para validación condicional
      const cartItemsForBackend = cartItems.map(item => ({ type: item.type }))
      await createSession(
        epicId.trim(),
        contactPreference,
        contactPreference === 'EMAIL' ? contactValue.trim() : undefined,
        contactPreference === 'WHATSAPP' ? normalizePhoneNumber(contactValue) : undefined,
        cartItemsForBackend
      )
      // Mostrar estado de éxito por 1 segundo antes de continuar
      setShowSuccess(true)
      setTimeout(() => {
        onVerified()
      }, 1000)
    } catch (err: any) {
      // Si hay items de la tienda Y el error es de no tener bots, mostrar modal
      if (hasStoreItems && err.availableBots && Array.isArray(err.availableBots)) {
        setAvailableBots(err.availableBots)
        setSubmittedEpicId(epicId.trim())
        setShowNoBotsModal(true)
      } else if (!hasStoreItems && err.availableBots) {
        // Si NO hay items de tienda pero el backend dice que no hay bots,
        // continuar de todos modos porque no se necesitan
        setShowSuccess(true)
        setTimeout(() => {
          onVerified()
        }, 1000)
      } else {
        // Para otros errores, mostrar mensaje inline
        const friendlyMessage = err.message || "Error verificando cuenta"
        setLocalError(friendlyMessage)
      }
    }
  }

  const handleCloseModal = () => {
    setShowNoBotsModal(false)
    setAvailableBots([])
    setSubmittedEpicId("")
    router.push("/tienda")
  }

  const handleContinueWithoutStoreItems = () => {
    // Eliminar items de la tienda del carrito
    storeItems.forEach(item => {
      removeFromCart(item.id)
    })

    // Cerrar el modal y continuar
    setShowNoBotsModal(false)
    setAvailableBots([])
    setSubmittedEpicId("")

    // Continuar con el checkout
    setShowSuccess(true)
    setTimeout(() => {
      onVerified()
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedBotId(text)
    setTimeout(() => setCopiedBotId(null), 2000)
  }

  /**
   * Verifica si el usuario tiene friendships válidas para continuar con items de tienda
   * Se usa cuando el usuario ya tiene sesión (autenticado via OTP u otro método)
   */
  const handleContinueWithExistingSession = async () => {
    // Si no hay store items, no necesita verificar friendships
    if (storeItems.length === 0) {
      onVerified()
      return
    }

    // Si hay store items, verificar friendships
    setIsVerifyingFriendships(true)
    setLocalError("")

    try {
      // Crear sesión con los cartItems para que el backend verifique friendships
      const cartItemsForBackend = cartItems.map(item => ({ type: item.type }))
      await customerContext?.createSession(
        customer!.epicAccountId,
        customer!.contactPreference,
        customer!.email,
        customer!.phoneNumber,
        cartItemsForBackend
      )

      // Si llegamos aquí, la verificación pasó
      onVerified()
    } catch (err: any) {
      // Si hay availableBots, mostrar el modal de bots
      if (err.availableBots && Array.isArray(err.availableBots)) {
        setAvailableBots(err.availableBots)
        setSubmittedEpicId(customer!.displayName || customer!.epicAccountId)
        setShowNoBotsModal(true)
      } else {
        setLocalError(err.message || "Error verificando amistad con bots")
      }
    } finally {
      setIsVerifyingFriendships(false)
    }
  }

  if (customer) {
    return (
      <div className="bg-dark border border-secondary rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Cuenta Verificada</h3>
            <p className="text-sm text-gray-400">Revisa tus datos antes de continuar</p>
          </div>
        </div>

        <div className="bg-darker rounded-lg p-4 mb-4 space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Epic ID</p>
            <p className="text-white font-medium text-base">{customer.displayName || customer.epicAccountId}</p>
            {customer.displayName && (
              <p className="text-gray-500 font-mono text-xs mt-1">{customer.epicAccountId}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              {customer.contactPreference === 'WHATSAPP' ? 'WhatsApp' : 'Email'}
            </p>
            <p className="text-white text-sm flex items-center gap-2">
              {customer.contactPreference === 'WHATSAPP' ? (
                <>
                  <WhatsAppIcon className="w-4 h-4 text-green-400" />
                  {customer.phoneNumber}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-blue-400" />
                  {customer.email}
                </>
              )}
            </p>
          </div>
        </div>

        {customer.tier !== "REGULAR" && (
          <div className="bg-accent/10 border border-accent rounded-lg p-3 mb-4">
            <p className="text-sm text-accent font-medium">
              ⭐ Cliente {customer.tier} - Descuentos especiales aplicados
            </p>
          </div>
        )}

        {/* Mostrar advertencia si tiene store items y necesita verificar friendships */}
        {storeItems.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-400">
              ℹ️ Tienes {storeItems.length} {storeItems.length === 1 ? 'item' : 'items'} de la tienda. Se verificará tu amistad con nuestros bots al continuar.
            </p>
          </div>
        )}

        {/* Mostrar error si hay */}
        {localError && !showNoBotsModal && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{localError}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (logout) logout()
              setEpicId("")
              setContactValue("")
              setContactPreference('WHATSAPP')
              setLocalError("")
            }}
            disabled={isVerifyingFriendships}
            className="flex-1 py-3 bg-dark hover:bg-light text-white font-medium rounded-lg transition-colors border border-light disabled:opacity-50"
          >
            Cambiar Cuenta
          </button>
          <button
            onClick={handleContinueWithExistingSession}
            disabled={isVerifyingFriendships}
            className="flex-1 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors neon-border-cyan disabled:opacity-50 flex items-center justify-center"
          >
            {isVerifyingFriendships ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              "Continuar"
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark border border-light rounded-lg p-6">
      <h2 className="text-2xl font-russo text-white mb-2">Verificación de Cuenta</h2>
      <p className="text-gray-400 mb-6">Ingresa tu Epic ID y email para continuar</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="epicId" className="block text-sm font-medium text-gray-300 mb-2">
            Epic ID *
          </label>
          <input
            type="text"
            id="epicId"
            value={epicId}
            onChange={(e) => setEpicId(e.target.value)}
            placeholder="Ej: TheProPlayer#1"
            className="w-full px-4 py-3 bg-darker border border-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary transition-colors"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Tu nombre de usuario en Fortnite (lo encuentras en el lobby o perfil)
          </p>
        </div>

        {/* Selector de preferencia de contacto */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ¿Cómo prefieres que te contactemos? *
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setContactPreference('WHATSAPP'); setContactValue(''); setLocalError(''); }}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                contactPreference === 'WHATSAPP'
                  ? 'border-green-500 bg-green-500/10 text-green-400'
                  : 'border-light hover:border-gray-500 text-gray-400'
              } disabled:opacity-50`}
            >
              <WhatsAppIcon className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => { setContactPreference('EMAIL'); setContactValue(''); setLocalError(''); }}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                contactPreference === 'EMAIL'
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-light hover:border-gray-500 text-gray-400'
              } disabled:opacity-50`}
            >
              <Mail className="w-5 h-5" />
              Email
            </button>
          </div>
        </div>

        {/* Campo dinámico según preferencia */}
        <div>
          <label htmlFor="contactValue" className="block text-sm font-medium text-gray-300 mb-2">
            {contactPreference === 'WHATSAPP' ? 'Número de WhatsApp' : 'Correo electrónico'} *
          </label>
          <input
            type={contactPreference === 'WHATSAPP' ? 'tel' : 'email'}
            id="contactValue"
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder={contactPreference === 'WHATSAPP' ? '+56 9 1234 5678' : 'tu@email.com'}
            className="w-full px-4 py-3 bg-darker border border-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-secondary transition-colors"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Aquí recibirás el código para ver tus compras
          </p>
        </div>

        {(localError || error) && !showNoBotsModal && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{localError || error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || showSuccess}
          className={`w-full py-3 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center ${
            showSuccess
              ? "bg-green-500 hover:bg-green-500 border-2 border-green-400"
              : "bg-primary hover:bg-secondary neon-border-cyan disabled:opacity-50"
          }`}
        >
          {showSuccess ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              ¡Verificado! Continuando...
            </>
          ) : isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            "Continuar"
          )}
        </button>
      </form>

      {/* Modal de No Bots */}
      {showNoBotsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-darker border-2 border-secondary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto neon-border-cyan">
            {/* Header del Modal */}
            <div className="bg-secondary/10 border-b border-secondary/30 p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-secondary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-2xl font-russo text-white mb-2">
                    Hola <span className="text-primary">{submittedEpicId}</span>
                  </h2>
                  <p className="text-base text-white font-semibold">
                    Necesitas agregar a nuestros Bots como amigos para continuar
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    Detectamos que tienes <strong className="text-white">{storeItems.length} {storeItems.length === 1 ? 'item' : 'items'}</strong> de la tienda en tu carrito. Estos items se envían como regalos a través de nuestros Bots de Fortnite, por lo que necesitas tenerlos agregados como amigos.
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-4">
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                <p className="text-base text-white leading-relaxed">
                  <strong className="text-secondary">💡 Consejo:</strong> Por lo general tendrás mejores resultados si agregas más de un Bot.
                </p>
              </div>

              <div>
                <p className="text-base text-white font-medium mb-3">
                  🤖 Bots Disponibles:
                </p>
                <div className="space-y-2">
                  {availableBots.map((bot) => (
                    <div
                      key={bot.epicId}
                      className="bg-dark rounded-lg p-4 flex items-center justify-between border border-light hover:border-primary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium text-base">{bot.displayName}</p>
                        <p className="text-gray-400 text-sm font-mono mt-1">{bot.epicId}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bot.epicId)}
                        className="ml-3 px-4 py-2 bg-primary hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 neon-border-cyan"
                      >
                        {copiedBotId === bot.epicId ? (
                          <>
                            <Check className="w-4 h-4" />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copiar ID
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-dark border border-light rounded-lg p-5 space-y-3">
                <p className="text-sm text-gray-200">
                  <strong className="text-white text-base">⏱️ Importante:</strong> Por políticas de la tienda, no podemos enviarte tu compra hasta <strong className="text-white">48 horas después</strong> de que aceptes la amistad.
                </p>
                <p className="text-sm text-gray-200">
                  <strong className="text-white text-base">📦 Límite diario:</strong> Cada Bot solo puede enviar <strong className="text-white">5 items al día</strong>, por eso recomendamos agregar varios Bots.
                </p>
                <p className="text-sm text-gray-200 mt-3 pt-3 border-t border-light/30">
                  <strong className="text-primary text-base">📝 Pasos a seguir:</strong> Copia el ID del Bot, agrégalo como amigo en Fortnite, espera a que acepte la solicitud y luego de 48 horas regresa aquí para que puedas continuar con tu compra.
                </p>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="border-t border-light p-6 space-y-3">
              {nonStoreItems.length > 0 && (
                <>
                  <div className="bg-accent/10 border border-accent rounded-lg p-4">
                    <p className="text-sm text-white leading-relaxed">
                      <strong className="text-accent">✨ Opción alternativa:</strong> Tienes <strong>{nonStoreItems.length} {nonStoreItems.length === 1 ? 'item' : 'items'}</strong> en tu carrito que no requieren amistad con los Bots (V-Bucks, Crew o Paquetes). Puedes continuar tu compra solo con {nonStoreItems.length === 1 ? 'ese item' : 'esos items'}.
                    </p>
                  </div>
                  <button
                    onClick={handleContinueWithoutStoreItems}
                    className="w-full py-3 bg-accent hover:bg-accent/80 text-dark font-bold rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Continuar solo con {nonStoreItems.length === 1 ? 'ese item' : 'esos items'}
                  </button>
                </>
              )}
              <button
                onClick={handleCloseModal}
                className="w-full py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors flex items-center justify-center neon-border-cyan"
              >
                <X className="w-5 h-5 mr-2" />
                Volver a la Tienda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
