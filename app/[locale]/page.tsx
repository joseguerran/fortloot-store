"use client"

import { useState } from "react"
import { Footer } from "@/components/layout/Footer"
import { ScrollToTop } from "@/components/ui/ScrollToTop"
import { RefundPolicyModal } from "@/components/modals/RefundPolicyModal"
import { PrivacyPolicyModal } from "@/components/modals/PrivacyPolicyModal"
import { TermsConditionsModal } from "@/components/modals/TermsConditionsModal"
import { HeroSection } from "@/components/sections/HeroSection"
import { ProductsSection } from "@/components/sections/ProductsSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { PaymentMethodsSection } from "@/components/sections/PaymentMethodsSection"
import { ContactSection } from "@/components/sections/ContactSection"

export default function LandingPage() {
  const [refundPolicyOpen, setRefundPolicyOpen] = useState(false)
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false)
  const [termsConditionsOpen, setTermsConditionsOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-dark">
      <main>
        <HeroSection />
        <ProductsSection />
        <HowItWorksSection />
        <PaymentMethodsSection />
        <ContactSection />
      </main>
      <Footer
        setRefundPolicyOpen={setRefundPolicyOpen}
        setPrivacyPolicyOpen={setPrivacyPolicyOpen}
        setTermsConditionsOpen={setTermsConditionsOpen}
      />
      <ScrollToTop />
      <RefundPolicyModal isOpen={refundPolicyOpen} onClose={() => setRefundPolicyOpen(false)} />
      <PrivacyPolicyModal isOpen={privacyPolicyOpen} onClose={() => setPrivacyPolicyOpen(false)} />
      <TermsConditionsModal isOpen={termsConditionsOpen} onClose={() => setTermsConditionsOpen(false)} />
    </div>
  )
}
