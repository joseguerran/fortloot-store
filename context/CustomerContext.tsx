"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { customerAPI, type Customer, type ContactPreference } from "@/lib/api/customer"

interface CustomerContextType {
  customer: Omit<Customer, 'sessionToken'> | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  createSession: (
    epicAccountId: string,
    contactPreference: ContactPreference,
    email?: string,
    phoneNumber?: string,
    cartItems?: Array<{ type: string }>
  ) => Promise<void>
  setSessionFromOTP: (customerData: Omit<Customer, 'sessionToken'>) => void
  verifyFriendship: (epicAccountId: string) => Promise<boolean>
  refreshCustomer: () => Promise<void>
  logout: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

// Legacy keys to clean up (migration from localStorage to httpOnly cookies)
const LEGACY_SESSION_TOKEN_KEY = "fortloot_session_token"
const LEGACY_CUSTOMER_KEY = "fortloot_customer"

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Omit<Customer, 'sessionToken'> | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch customer data from backend (token is sent via httpOnly cookie)
  const fetchCustomerData = useCallback(async (): Promise<Omit<Customer, 'sessionToken'> | null> => {
    try {
      const data = await customerAPI.getMe()
      return data
    } catch (err) {
      // If session is invalid, return null
      if (err instanceof Error && err.message.includes('Invalid')) {
        return null
      }
      throw err
    }
  }, [])

  // Clean up legacy localStorage and check session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Clean up legacy localStorage data (migration to httpOnly cookies)
        if (typeof window !== 'undefined') {
          localStorage.removeItem(LEGACY_SESSION_TOKEN_KEY)
          localStorage.removeItem(LEGACY_CUSTOMER_KEY)
        }

        // Try to fetch customer data (session is in httpOnly cookie)
        const customerData = await fetchCustomerData()
        if (customerData) {
          setCustomer(customerData)
          setIsAuthenticated(true)
        } else {
          setCustomer(null)
          setIsAuthenticated(false)
        }
      } catch {
        // Session load failed silently - user is not authenticated
        setCustomer(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [fetchCustomerData])

  const createSession = async (
    epicAccountId: string,
    contactPreference: ContactPreference,
    email?: string,
    phoneNumber?: string,
    cartItems?: Array<{ type: string }>
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create session - backend sets httpOnly cookie automatically
      await customerAPI.createSession({
        epicAccountId,
        contactPreference,
        email,
        phoneNumber,
        cartItems
      })

      // Fetch customer data (session cookie was set by the API)
      const customerData = await fetchCustomerData()
      if (customerData) {
        if (customerData.isBlacklisted) {
          throw new Error("Tu cuenta ha sido bloqueada. Contacta a soporte.")
        }
        setCustomer(customerData)
        setIsAuthenticated(true)
      }
    } catch (err: any) {
      let errorMessage = err.message || "Error creando sesión"

      // If there are availableBots, don't set error state (modal will handle it)
      if (!err.data?.availableBots) {
        setError(errorMessage)
      }

      // Propagate the full error object including availableBots if present
      const enhancedError = new Error(errorMessage) as any
      if (err.data?.availableBots) {
        enhancedError.availableBots = err.data.availableBots
      }
      throw enhancedError
    } finally {
      setIsLoading(false)
    }
  }

  const verifyFriendship = async (epicAccountId: string) => {
    try {
      const response = await customerAPI.verifyFriendship(epicAccountId)
      return response.hasReadyFriendship
    } catch {
      return false
    }
  }

  const refreshCustomer = async () => {
    if (!isAuthenticated) return

    try {
      const customerData = await fetchCustomerData()
      if (customerData) {
        setCustomer(customerData)
      }
    } catch {
      // Silently fail - customer data will be stale but app remains functional
    }
  }

  // Set session from external OTP verification (e.g., from mis-compras page)
  // The httpOnly cookie is already set by the OTP verify API
  const setSessionFromOTP = (customerData: Omit<Customer, 'sessionToken'>) => {
    setCustomer(customerData)
    setIsAuthenticated(true)
  }

  const logout = async () => {
    try {
      // Call logout API to clear the httpOnly cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Silently fail - continue with local cleanup
    }

    setCustomer(null)
    setIsAuthenticated(false)
    setError(null)

    // Clean up any legacy localStorage keys
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LEGACY_SESSION_TOKEN_KEY)
      localStorage.removeItem(LEGACY_CUSTOMER_KEY)
    }
  }

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isAuthenticated,
        isLoading,
        error,
        createSession,
        setSessionFromOTP,
        verifyFriendship,
        refreshCustomer,
        logout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  return context
}
