'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getConsentSessionId } from '@/lib/fingerprint'

export interface ConsentState {
  necessary: boolean    // Siempre true - sesión, carrito
  preferences: boolean  // Idioma, tema
  analytics: boolean    // GA4, Clarity
  marketing: boolean    // Futuro: FB Pixel, etc.
}

interface ConsentContextType {
  consent: ConsentState
  hasConsented: boolean
  acceptAll: () => void
  rejectAll: () => void
  updateConsent: (consent: Partial<ConsentState>) => void
  showBanner: boolean
  setShowBanner: (show: boolean) => void
  openPreferences: () => void
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

const CONSENT_KEY = 'fortloot_cookie_consent'
const CONSENT_TIMESTAMP_KEY = 'fortloot_consent_timestamp'
const POLICY_VERSION = '1.0' // Incrementar cuando cambie la política de privacidad

const defaultConsent: ConsentState = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
}

/**
 * Registra el consentimiento en el servidor para evidencia legal GDPR
 */
async function recordConsentToServer(consent: ConsentState): Promise<void> {
  try {
    const sessionId = await getConsentSessionId()

    await fetch('/api/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        consent,
        policyVersion: POLICY_VERSION,
      }),
    })
  } catch {
    // Silently fail - localStorage consent is still saved
    // Server recording is best-effort for legal compliance
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent)
  const [hasConsented, setHasConsented] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  // Load consent from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored) {
        const parsedConsent = JSON.parse(stored)
        setConsent({ ...defaultConsent, ...parsedConsent, necessary: true })
        setHasConsented(true)
        setShowBanner(false)
      } else {
        setShowBanner(true)
      }
    } catch {
      setShowBanner(true)
    }
  }, [])

  const saveConsent = (newConsent: ConsentState) => {
    const consentToSave = { ...newConsent, necessary: true }
    setConsent(consentToSave)
    setHasConsented(true)
    setShowBanner(false)

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consentToSave))
      localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString())
    } catch {
      // localStorage not available
    }

    // Record to server for GDPR compliance (async, non-blocking)
    recordConsentToServer(consentToSave)
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    })
  }

  const rejectAll = () => {
    saveConsent(defaultConsent)
  }

  const updateConsent = (partial: Partial<ConsentState>) => {
    saveConsent({ ...consent, ...partial, necessary: true })
  }

  const openPreferences = () => {
    setShowBanner(true)
  }

  // Always render the provider - during SSR use default values
  // The banner and analytics are client components that will re-render after hydration
  return (
    <ConsentContext.Provider value={{
      consent,
      hasConsented,
      acceptAll,
      rejectAll,
      updateConsent,
      showBanner,
      setShowBanner,
      openPreferences,
    }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const context = useContext(ConsentContext)
  if (context === undefined) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }
  return context
}
