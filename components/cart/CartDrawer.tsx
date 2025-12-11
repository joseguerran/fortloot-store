"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2, ShoppingCart, Coins, CreditCard, MessageCircle, Wrench } from "lucide-react"
import { useCart, type CartItem } from "@/context/CartContext"
import { useConfig } from "@/context/ConfigContext"
import { useMaintenance } from "@/context/AnnouncementContext"
import { openWhatsAppWithCart } from "@/utils/whatsapp"
import { OptimizedImage } from "@/components/ui/OptimizedImage"
import { useToast } from "@/components/ui/use-toast"
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon"

export function CartDrawer() {
  const t = useTranslations('common.cart')
  const tMaintenance = useTranslations('checkout.maintenance')
  const locale = useLocale()
  const { cartItems, isCartOpen, closeCart, removeFromCart, clearCart, totalItems, totalPrice, isLoadingPrices } =
    useCart()
  const { checkoutMode } = useConfig()
  const { isInMaintenance, maintenanceMessage } = useMaintenance()
  const { toast } = useToast()
  const cartRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return
    }

    // Conditional logic based on configured checkout mode
    if (checkoutMode === "wizard") {
      closeCart()
      router.push(`/${locale}/checkout`)
    } else if (checkoutMode === "bot-wizard") {
      toast({
        title: locale === 'es' ? "Próximamente" : "Coming Soon",
        description: locale === 'es' ? "El checkout automático por bot estará disponible pronto." : "Automatic bot checkout will be available soon.",
        variant: "default",
      })
    } else {
      // WhatsApp mode (default)
      openWhatsAppWithCart(cartItems, totalPrice)
      closeCart()
    }
  }

  const handleContinueShopping = () => {
    closeCart()
    router.push(`/${locale}/store`)
  }

  // Close cart on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node) && isCartOpen) {
        closeCart()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isCartOpen, closeCart])

  // Prevent scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isCartOpen])


  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            ref={cartRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-darker z-50 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-light flex justify-between items-center bg-dark">
              <h2 className="text-xl font-['Russo_One'] text-white flex items-center">
                <ShoppingCart className="mr-2 text-primary" />
                {t('title')}
              </h2>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-light transition-colors"
                aria-label={locale === 'es' ? "Cerrar carrito" : "Close cart"}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-500 mb-4" />
                  <p className="text-gray-300 text-lg mb-2">{t('empty')}</p>
                  <p className="text-gray-500 mb-6">{t('emptyDescription')}</p>
                  <button
                    onClick={handleContinueShopping}
                    className="py-3 px-6 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors neon-border-cyan"
                  >
                    {t('continueShopping')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-light bg-dark">
                {/* Maintenance Banner inside Cart */}
                {isInMaintenance && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-2 text-primary">
                      <Wrench className="w-5 h-5 animate-pulse" />
                      <div>
                        <p className="font-bold text-sm">{maintenanceMessage?.title || tMaintenance('title')}</p>
                        <p className="text-xs text-gray-300">{maintenanceMessage?.message || tMaintenance('disabled')}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-300">{t('total')} ({totalItems} {totalItems === 1 ? t('item') : t('items')}):</span>
                  <div className="flex flex-col items-end">
                    <span className="text-white font-bold text-lg">
                      ${isLoadingPrices ? "..." : totalPrice.toFixed(2)}
                    </span>
                    {isLoadingPrices && <span className="text-xs text-gray-400">{locale === 'es' ? 'Calculando...' : 'Calculating...'}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleCheckout}
                    disabled={isLoadingPrices || isInMaintenance}
                    className={`w-full py-3 px-4 text-white font-bold rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isInMaintenance
                        ? "bg-gray-600"
                        : checkoutMode === "whatsapp"
                        ? "bg-[#25D366] hover:bg-[#20BA5A]"
                        : "bg-primary hover:bg-secondary neon-border-cyan"
                    }`}
                  >
                    {isInMaintenance ? (
                      <>
                        <Wrench className="w-5 h-5 mr-2" />
                        {locale === 'es' ? 'Checkout Deshabilitado' : 'Checkout Disabled'}
                      </>
                    ) : checkoutMode === "whatsapp" ? (
                      <>
                        <WhatsAppIcon className="w-5 h-5 mr-2" size={20} />
                        {locale === 'es' ? 'Finalizar Compra por WhatsApp' : 'Complete Purchase via WhatsApp'}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {t('checkout')}
                      </>
                    )}
                  </button>
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={clearCart}
                      className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('clear')}
                    </button>
                    <button
                      onClick={handleContinueShopping}
                      className="flex-1 py-2 px-4 bg-[#00F5D4] hover:bg-[#00D5C0] text-darker font-bold rounded-lg transition-colors"
                    >
                      {t('continueShopping')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CartItemCard({ item }: { item: CartItem }) {
  const t = useTranslations('common.cart')
  const { removeFromCart } = useCart()

  // Get price from backend (already calculated in cents)
  const finalPrice = item.price?.finalPrice || 0
  const displayPrice = `$${(finalPrice / 100).toFixed(2)}`

  return (
    <div className="bg-light rounded-lg overflow-hidden flex">
      {/* Image */}
      <div className="w-24 h-24 relative flex-shrink-0">
        <OptimizedImage src={item.image} alt={item.name} fill className="object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 p-3 flex flex-col">
        <div className="flex justify-between">
          <h3 className="font-medium text-white line-clamp-1">{item.name}</h3>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label={t('remove')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-gray-400 text-sm line-clamp-1 mb-2">{item.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <div></div>
          <div className="flex flex-col items-end">
            <span className="text-[#ADFF2F] font-bold">{displayPrice}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
