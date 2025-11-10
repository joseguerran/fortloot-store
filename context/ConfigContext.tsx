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
          console.warn(`Invalid checkout mode received: ${mode}, defaulting to whatsapp`);
          setCheckoutMode('whatsapp');
        }
      } else {
        console.warn('Failed to fetch checkout mode, defaulting to whatsapp');
        setCheckoutMode('whatsapp');
      }

      // Fetch manual checkout enabled
      const manualResponse = await fetch('/api/config/manual-checkout', {
        cache: 'no-store',
      });

      console.log('🔧 Manual checkout response status:', manualResponse.status);

      if (manualResponse.ok) {
        const data = await manualResponse.json();
        console.log('🔧 Manual checkout data received:', data);
        setManualCheckoutEnabled(data.enabled || false);
      } else {
        console.warn('🔧 Manual checkout response not OK, defaulting to false');
        setManualCheckoutEnabled(false);
      }
    } catch (error) {
      console.warn('Error fetching config, using defaults:', error);
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
