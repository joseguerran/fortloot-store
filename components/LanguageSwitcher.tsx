"use client"

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { locales, type Locale } from '@/i18n/config'
import { Globe } from 'lucide-react'

const languageNames: Record<Locale, string> = {
  es: 'ES',
  en: 'EN'
}

const languageFullNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English'
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return

    // Replace the locale in the pathname
    const segments = pathname.split('/')
    // The first segment is empty, the second is the locale
    if (segments[1] && locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale
    } else {
      // If no locale in path, prepend it
      segments.splice(1, 0, newLocale)
    }

    const newPath = segments.join('/') || `/${newLocale}`
    router.push(newPath)
  }

  const otherLocale = locale === 'es' ? 'en' : 'es'

  return (
    <button
      onClick={() => switchLocale(otherLocale)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark/50 hover:bg-light/50 border border-light/30 text-white transition-all duration-200 text-sm font-medium"
      title={`Switch to ${languageFullNames[otherLocale]}`}
    >
      <Globe className="w-4 h-4 text-secondary" />
      <span>{languageNames[otherLocale]}</span>
    </button>
  )
}
