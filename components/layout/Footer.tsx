"use client"

import { memo } from "react"
import Link from "next/link"
import type { FooterProps } from "@/types"
import { scrollToSection } from "@/utils/helpers"

const footerLinks = [
  { name: "Inicio", id: "inicio" },
  { name: "Servicios", id: "productos" },
  { name: "Cómo Funciona", id: "como-funciona" },
  { name: "Métodos de Pago", id: "metodos-de-pago" },
  { name: "Contacto", id: "contacto" },
]

export const Footer = memo(({ setRefundPolicyOpen, setPrivacyPolicyOpen, setTermsConditionsOpen }: FooterProps) => {
  return (
    <footer className="bg-darker text-gray-400 py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <span className="text-white font-['Russo_One'] text-xl">Fort</span>
              <span className="text-primary font-['Russo_One'] text-xl neon-text">Loot</span>
            </Link>
            <p className="text-sm">La mejor tienda de monedas y objetos virtuales para tu juego favorito.</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              {footerLinks.map((item) => (
                <li key={item.name}>
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
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setTermsConditionsOpen(true)}
                  className="text-gray-400 hover:text-secondary transition-colors duration-300 text-left"
                >
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <button
                  onClick={() => setPrivacyPolicyOpen(true)}
                  className="text-gray-400 hover:text-secondary transition-colors duration-300 text-left"
                >
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRefundPolicyOpen(true)}
                  className="text-gray-400 hover:text-secondary transition-colors duration-300 text-left"
                >
                  Política de Reembolso
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-light mt-8 pt-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} FortLoot. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
})

Footer.displayName = "Footer"
