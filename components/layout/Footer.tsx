"use client"

import { memo } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import type { FooterProps } from "@/types"
import { scrollToSection } from "@/utils/helpers"

export const Footer = memo(({ setRefundPolicyOpen, setPrivacyPolicyOpen, setTermsConditionsOpen }: FooterProps) => {
  const t = useTranslations('common')
  const locale = useLocale()
  const homePath = `/${locale}`

  const footerLinks = [
    { name: t('header.home'), id: "inicio" },
    { name: t('header.services'), id: "productos" },
    { name: t('header.howItWorks'), id: "como-funciona" },
    { name: t('header.paymentMethods'), id: "metodos-de-pago" },
    { name: t('header.contact'), id: "contacto" },
  ]

  return (
    <footer className="bg-darker text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Link href={homePath} className="flex items-center mb-4">
              <span className="text-white font-['Russo_One'] text-xl">Fort</span>
              <span className="text-primary font-['Russo_One'] text-xl neon-text">Loot</span>
            </Link>
            <p className="text-sm">{t('footer.slogan')}</p>
            <p className="text-xs mt-2 text-gray-500">{t('footer.disclaimer')}</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {footerLinks.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`#${item.id}`}
                    className="text-gray-400 hover:text-secondary transition-colors duration-300"
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(item.id)
                    }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setTermsConditionsOpen(true)}
                  className="text-gray-400 hover:text-secondary transition-colors duration-300 text-left"
                >
                  {t('footer.termsConditions')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPrivacyPolicyOpen(true)}
                  className="text-gray-400 hover:text-secondary transition-colors duration-300 text-left"
                >
                  {t('footer.privacyPolicy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRefundPolicyOpen(true)}
                  className="text-gray-400 hover:text-secondary transition-colors duration-300 text-left"
                >
                  {t('footer.refundPolicy')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-light mt-8 pt-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} FortLoot. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
})

Footer.displayName = "Footer"
