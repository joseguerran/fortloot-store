'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CheckoutMode = 'whatsapp' | 'wizard' | 'bot-wizard';

interface ConfigContextType {
  checkoutMode: CheckoutMode;
  manualCheckoutEnabled: boolean;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('whatsapp');
  const [manualCheckoutEnabled, setManualCheckoutEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      // Fetch checkout mode
      const modeResponse = await fetch('/api/config/checkout-mode', {
        cache: 'no-store',
      });

      if (modeResponse.ok) {
        const data = await modeResponse.json();
        const mode = data.value || data.checkoutMode || 'whatsapp';

        // Validar que sea un modo válido
        if (['whatsapp', 'wizard', 'bot-wizard'].includes(mode)) {
          setCheckoutMode(mode as CheckoutMode);
        } else {
          setCheckoutMode('whatsapp');
        }
      } else {
        setCheckoutMode('whatsapp');
      }

      // Fetch manual checkout enabled
      const manualResponse = await fetch('/api/config/manual-checkout', {
        cache: 'no-store',
      });

      if (manualResponse.ok) {
        const data = await manualResponse.json();
        setManualCheckoutEnabled(data.enabled || false);
      } else {
        setManualCheckoutEnabled(false);
      }
    } catch {
      setCheckoutMode('whatsapp');
      setManualCheckoutEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConfig = async () => {
    setIsLoading(true);
    await fetchConfig();
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ checkoutMode, manualCheckoutEnabled, isLoading, refreshConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
