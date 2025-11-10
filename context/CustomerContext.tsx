"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { customerAPI, type Customer } from "@/lib/api/customer"

interface CustomerContextType {
  customer: Customer | null
  isLoading: boolean
  error: string | null
  createSession: (epicAccountId: string, email: string, cartItems?: Array<{ type: string }>) => Promise<void>
  verifyFriendship: (epicAccountId: string) => Promise<boolean>
  logout: () => void
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

const CUSTOMER_STORAGE_KEY = "fortloot_customer"

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar customer desde localStorage al montar
  useEffect(() => {
    const loadCustomer = () => {
      try {
        const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          console.log("✅ Customer loaded from localStorage:", parsed)
          setCustomer(parsed)

          // Guardar el sessionToken separado para el API client
          if (parsed.sessionToken) {
            localStorage.setItem("fortloot_session_token", parsed.sessionToken)
          }
        } else {
          console.log("❌ No customer found in localStorage")
        }
      } catch (err) {
        console.error("Error loading customer from storage:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomer()
  }, [])

  // Guardar customer en localStorage cuando cambie
  useEffect(() => {
    if (customer) {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer))
      if (customer.sessionToken) {
        localStorage.setItem("fortloot_session_token", customer.sessionToken)
      }
    } else {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY)
      localStorage.removeItem("fortloot_session_token")
    }
  }, [customer])

  const createSession = async (epicAccountId: string, email: string, cartItems?: Array<{ type: string }>) => {
    setIsLoading(true)
    setError(null)

    try {
      const customerData = await customerAPI.createSession({ epicAccountId, email, cartItems })
      console.log("✅ Customer session created:", customerData)

      if (customerData.isBlacklisted) {
        throw new Error("Tu cuenta ha sido bloqueada. Contacta a soporte.")
      }

      setCustomer(customerData)
    } catch (err: any) {
      console.log("❌ Error in createSession:", err)
      console.log("❌ Error data:", err.data)
      console.log("❌ Available bots:", err.data?.availableBots)

      // Si el error es de tipo NO_BOT_FRIENDSHIP, no mostrarlo como texto de error
      // porque el modal se encargará de mostrarlo
      let errorMessage = err.message || "Error creando sesión"

      // Si hay availableBots, no guardar el error en el estado
      // para que no se muestre el mensaje inline
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

  const logout = () => {
    setCustomer(null)
    setError(null)
  }

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoading,
        error,
        createSession,
        verifyFriendship,
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
