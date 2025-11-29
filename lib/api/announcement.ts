/**
 * Announcement API Service
 * Gestión de anuncios y estado de mantenimiento
 */

import { apiClient } from './client'

export interface Announcement {
  id: string
  type: 'MAINTENANCE' | 'PROMOTION'
  title: string
  message: string
  imageUrl: string | null
  productId: string | null
  product?: {
    id: string
    name: string
    image: string
    type: string
  } | null
  linkUrl: string | null
  linkText: string | null
  isActive: boolean
  priority: number
  startsAt: string | null
  endsAt: string | null
}

export interface MaintenanceStatus {
  isInMaintenance: boolean
  announcement: {
    id: string
    title: string
    message: string
  } | null
}

export const announcementAPI = {
  /**
   * Obtener todos los anuncios activos
   */
  async getActiveAnnouncements(): Promise<Announcement[]> {
    return apiClient.get<Announcement[]>('/api/announcements')
  },

  /**
   * Obtener estado de mantenimiento
   */
  async getMaintenanceStatus(): Promise<MaintenanceStatus> {
    return apiClient.get<MaintenanceStatus>('/api/announcements/maintenance')
  },

  /**
   * Obtener solo anuncios de tipo promoción
   */
  async getPromotions(): Promise<Announcement[]> {
    const announcements = await this.getActiveAnnouncements()
    return announcements.filter(a => a.type === 'PROMOTION')
  },
}
