import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api'
const API_SECRET = process.env.API_SECRET

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const priceUsd = searchParams.get('priceUsd')

    if (!priceUsd) {
      return NextResponse.json(
        { success: false, error: 'priceUsd query parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/payment-methods/${id}/price?priceUsd=${priceUsd}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_SECRET!,
        },
        cache: 'no-store',
      }
    )

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
    console.error('Error fetching payment method price:', error)
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch price' },
      { status: 500 }
    )
  }
}
