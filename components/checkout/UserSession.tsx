"use client"

import { User, LogOut } from "lucide-react"
import { useCustomer } from "@/context/CustomerContext"

interface UserSessionProps {
  onLogout?: () => void
}

export function UserSession({ onLogout }: UserSessionProps) {
  const customerContext = useCustomer()
  const customer = customerContext?.customer || null
  const logout = customerContext?.logout

  if (!customer) return null

  const handleLogout = () => {
    if (logout) {
      logout()
      if (onLogout) {
        onLogout()
      }
    }
  }

  return (
    <div className="bg-dark/50 border border-light/30 rounded-lg p-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Comprando como:</p>
            <p className="text-white font-medium">{customer.epicAccountId}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-light/50 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <span className="hidden sm:inline">¿No eres tú?</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
