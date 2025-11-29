import type React from "react"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ScrollToTop } from "@/components/ui/ScrollToTop"
import { PromotionBanner } from "@/components/announcements"

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 pt-4">
        <PromotionBanner />
      </div>
      {children}
      <Footer />
      <ScrollToTop />
    </>
  )
}
