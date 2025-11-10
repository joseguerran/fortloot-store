import type React from "react"
// Tipos para los artículos de la tienda
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | string

export interface PriceInfo {
  regularPrice?: number
  finalPrice: number
  floorPrice?: number
}

export interface StoreItem {
  id: string
  name: string
  description: string
  price: PriceInfo
  image: string
  rarity: string
  type: string
  badge?: string
  vbucksPrice?: number
  requiresManualProcess?: boolean // Indica si el item requiere procesamiento manual
}

export interface TimeRemaining {
  hours: number
  minutes: number
  seconds: number
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface ModalContent {
  title: string
  children: React.ReactNode
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ModalContent
}

export interface FooterProps {
  setRefundPolicyOpen: (isOpen: boolean) => void
  setPrivacyPolicyOpen: (isOpen: boolean) => void
  setTermsConditionsOpen: (isOpen: boolean) => void
}
