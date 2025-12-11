import type React from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, type Locale } from '@/i18n/config'
import type { Metadata } from "next"
import { ConsentProvider } from "@/context/ConsentContext"
import { CustomerProvider } from "@/context/CustomerContext"
import { CartProvider } from "@/context/CartContext"
import { ConfigProvider } from "@/context/ConfigContext"
import { AnnouncementProvider } from "@/context/AnnouncementContext"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { Toaster } from "@/components/ui/toaster"
import { CookieBanner } from "@/components/cookies/CookieBanner"
import { ConditionalAnalytics } from "@/components/analytics/ConditionalAnalytics"
import { MaintenanceBanner } from "@/components/announcements"
import { ConditionalHeader } from "@/components/layout/ConditionalHeader"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const messages = await getMessages()
  const metadata = (messages as any).metadata || {}

  return {
    title: metadata.title || "FortLoot - Gaming Currencies",
    description: metadata.description || "The best store for virtual currencies and items for your favorite games.",
    generator: 'v0.dev',
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'es': '/es',
        'en': '/en',
      },
    },
  }
}

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Get messages for the locale
  const messages = await getMessages()

  // Update html lang attribute via script
  const setLangScript = `document.documentElement.lang = "${locale}";`

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <script dangerouslySetInnerHTML={{ __html: setLangScript }} />
      <ConsentProvider>
        <ConfigProvider>
          <AnnouncementProvider>
            <CustomerProvider>
              <CartProvider>
                <MaintenanceBanner />
                <ConditionalHeader />
                {children}
                <CartDrawer />
                <Toaster />
                <CookieBanner />
              </CartProvider>
            </CustomerProvider>
          </AnnouncementProvider>
        </ConfigProvider>
        <ConditionalAnalytics />
      </ConsentProvider>
    </NextIntlClientProvider>
  )
}
