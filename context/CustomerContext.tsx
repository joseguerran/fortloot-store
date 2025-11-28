"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { customerAPI, type Customer, type ContactPreference } from "@/lib/api/customer"

interface CustomerContextType {
  customer: Omit<Customer, 'sessionToken'> | null
  sessionToken: string | null
  isLoading: boolean
  error: string | null
  createSession: (
    epicAccountId: string,
    contactPreference: ContactPreference,
    email?: string,
    phoneNumber?: string,
    cartItems?: Array<{ type: string }>
  ) => Promise<void>
  setSessionFromOTP: (token: string, customerData: Omit<Customer, 'sessionToken'>) => void
  verifyFriendship: (epicAccountId: string) => Promise<boolean>
  refreshCustomer: () => Promise<void>
  logout: () => void
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

// Only store the session token - NOT the full customer object
const SESSION_TOKEN_KEY = "fortloot_session_token"
// Legacy key to clean up
const LEGACY_CUSTOMER_KEY = "fortloot_customer"

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Omit<Customer, 'sessionToken'> | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch customer data from backend using sessionToken
  const fetchCustomerData = useCallback(async (token: string): Promise<Omit<Customer, 'sessionToken'> | null> => {
    try {
      const data = await customerAPI.getMe(token)
      console.log("✅ Customer data fetched from backend:", data)
      return data
    } catch (err) {
      console.error("❌ Error fetching customer data:", err)
      // If session is invalid, clear it
      if (err instanceof Error && err.message.includes('Invalid')) {
        localStorage.removeItem(SESSION_TOKEN_KEY)
        return null
      }
      throw err
    }
  }, [])

  // Clean up legacy storage and load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Clean up legacy customer data storage (security fix)
        const legacyData = localStorage.getItem(LEGACY_CUSTOMER_KEY)
        if (legacyData) {
          console.log("🔒 Cleaning up legacy customer data from localStorage (security improvement)")
          localStorage.removeItem(LEGACY_CUSTOMER_KEY)
        }

        // Load session token
        const storedToken = localStorage.getItem(SESSION_TOKEN_KEY)
        if (storedToken) {
          console.log("✅ Session token found in localStorage")
          setSessionToken(storedToken)

          // Fetch customer data from backend
          const customerData = await fetchCustomerData(storedToken)
          if (customerData) {
            setCustomer(customerData)
          } else {
            // Invalid session, clean up
            setSessionToken(null)
            localStorage.removeItem(SESSION_TOKEN_KEY)
          }
        } else {
          console.log("❌ No session token found in localStorage")
        }
      } catch (err) {
        console.error("Error loading session:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [fetchCustomerData])

  // Persist session token changes
  useEffect(() => {
    if (sessionToken) {
      localStorage.setItem(SESSION_TOKEN_KEY, sessionToken)
    } else {
      localStorage.removeItem(SESSION_TOKEN_KEY)
    }
  }, [sessionToken])

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
      // Create session - backend returns only sessionToken now
      const { sessionToken: newToken } = await customerAPI.createSession({
        epicAccountId,
        contactPreference,
        email,
        phoneNumber,
        cartItems
      })
      console.log("✅ Session created, token received")

      // Store token
      setSessionToken(newToken)

      // Fetch customer data using the new token
      const customerData = await fetchCustomerData(newToken)
      if (customerData) {
        if (customerData.isBlacklisted) {
          throw new Error("Tu cuenta ha sido bloqueada. Contacta a soporte.")
        }
        setCustomer(customerData)
      }
    } catch (err: any) {
      console.log("❌ Error in createSession:", err)
      console.log("❌ Error data:", err.data)
      console.log("❌ Available bots:", err.data?.availableBots)

      let errorMessage = err.message || "Error creando sesión"

      // If there are availableBots, don't set error state (modal will handle it)
      if (!err.data?.availableBots) {
        setError(errorMessage)
      }

      // Propagate the full error object including availableBots if present
      const enhancedError = new Error(errorMessage) as any
      if (err.data?.availableBots) {
        enhancedError.availableBots = err.data.availableBots
        console.log("✅ Added availableBots to error:", enhancedError.availableBots)
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
    } catch (err) {
      console.error("Error verifying friendship:", err)
      return false
    }
  }

  const refreshCustomer = async () => {
    if (!sessionToken) return

    try {
      const customerData = await fetchCustomerData(sessionToken)
      if (customerData) {
        setCustomer(customerData)
      }
    } catch (err) {
      console.error("Error refreshing customer:", err)
    }
  }

  // Set session from external OTP verification (e.g., from mis-compras page)
  const setSessionFromOTP = (token: string, customerData: Omit<Customer, 'sessionToken'>) => {
    console.log("✅ Setting session from OTP verification")
    setSessionToken(token)
    setCustomer(customerData)
    // The useEffect will persist the token to localStorage
  }

  const logout = () => {
    setCustomer(null)
    setSessionToken(null)
    setError(null)
    localStorage.removeItem(SESSION_TOKEN_KEY)
    // Also remove legacy key if it exists
    localStorage.removeItem(LEGACY_CUSTOMER_KEY)
  }

  return (
    <CustomerContext.Provider
      value={{
        customer,
        sessionToken,
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
