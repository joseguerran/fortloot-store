"use client"

import { usePathname } from "next/navigation"
import { Header } from "./Header"

// Routes where the header should NOT be displayed
const ROUTES_WITHOUT_HEADER = ["/checkout", "/order-status"]

export function ConditionalHeader() {
  const pathname = usePathname()

  // Check if current path matches any route that shouldn't have the header
  const shouldHideHeader = ROUTES_WITHOUT_HEADER.some(route =>
    pathname.includes(route)
  )

  if (shouldHideHeader) {
    return null
  }

  return <Header />
}
