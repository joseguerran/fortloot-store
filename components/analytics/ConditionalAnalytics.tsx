'use client'

import { useConsent } from '@/context/ConsentContext'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ClarityScript } from './ClarityScript'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function ConditionalAnalytics() {
  const { consent, hasConsented } = useConsent()

  // Solo cargar analytics si el usuario ha dado consentimiento explícito
  if (!hasConsented || !consent.analytics) {
    return null
  }

  return (
    <>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      <ClarityScript />
    </>
  )
}
