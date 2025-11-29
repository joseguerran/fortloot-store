import { NextResponse } from "next/server"

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api'

export interface MaintenanceStatus {
  isInMaintenance: boolean
  announcement: {
    id: string
    title: string
    message: string
  } | null
}

export async function GET() {
  try {
    // Fetch maintenance status from backend (public endpoint, no auth needed)
    const response = await fetch(`${API_BASE_URL}/announcements/maintenance`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        data: {
          isInMaintenance: false,
          announcement: null,
        },
      })
    }

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json({
        success: true,
        data: {
          isInMaintenance: false,
          announcement: null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    })
  } catch (error) {
    // On error, assume no maintenance to avoid blocking users
    return NextResponse.json({
      success: true,
      data: {
        isInMaintenance: false,
        announcement: null,
      },
    })
  }
}
