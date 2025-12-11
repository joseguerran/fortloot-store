"use client"

import { MessageCircle, Package, AlertCircle } from "lucide-react"
import type { CartItem } from "@/context/CartContext"
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon"
import { useTranslations } from "next-intl"

interface ManualCheckoutMessageProps {
  manualItems: CartItem[]
  customerName: string
  onWhatsAppClick: () => void
}

export function ManualCheckoutMessage({ manualItems, customerName, onWhatsAppClick }: ManualCheckoutMessageProps) {
  const t = useTranslations("checkout.manualCheckout")

  return (
    <div className="bg-dark border border-light rounded-lg p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-russo text-white mb-2">{t("title")}</h2>
          <p className="text-gray-300 leading-relaxed">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="bg-darker border border-light rounded-lg p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-bold text-white">{t("itemsTitle")}</h3>
        </div>
        <div className="space-y-3">
          {manualItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-dark rounded-lg border border-light/50">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
              )}
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">{t("quantity")}: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">${((item.price?.finalPrice || 0) / 100).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-5 mb-6">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-secondary" />
          {t("whatNext")}
        </h3>
        <ol className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <span className="text-secondary font-bold">1.</span>
            <span>{t("step1")}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-secondary font-bold">2.</span>
            <span>{t("step2")}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-secondary font-bold">3.</span>
            <span>{t("step3")}</span>
          </li>
          <li className="flex gap-2">
            <span className="text-secondary font-bold">4.</span>
            <span>{t("step4")}</span>
          </li>
        </ol>
      </div>

      <button
        onClick={onWhatsAppClick}
        className="w-full py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-lg rounded-lg transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
      >
        <WhatsAppIcon className="w-6 h-6" size={24} />
        {t("continueWhatsapp")}
      </button>
    </div>
  )
}
