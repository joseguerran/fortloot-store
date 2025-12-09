import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api'
const API_SECRET = process.env.API_SECRET

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ currency: string }> }
) {
  try {
    const { currency } = await params

    const response = await fetch(`${BACKEND_URL}/exchange-rates/${currency}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_SECRET!,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'BACKEND_ERROR',
          message: errorData.message || `Backend returned ${response.status}`,
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching exchange rate:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch exchange rate' },
      { status: 500 }
    )
  }
}
