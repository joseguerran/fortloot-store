import { NextResponse } from "next/server"

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api'

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

export async function GET() {
  try {
    // Fetch active announcements from backend (public endpoint, no auth needed)
    const response = await fetch(`${API_BASE_URL}/announcements/active`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Error al cargar anuncios',
        data: [],
      })
    }

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({
        success: false,
        error: data.error || 'Respuesta inválida',
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      data: [],
    }, { status: 500 })
  }
}
