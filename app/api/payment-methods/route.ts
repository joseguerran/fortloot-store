import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    // Build query string
    const queryString = active ? `?active=${active}` : ''

    const response = await fetch(`${BACKEND_URL}/api/payment-methods${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache payment methods to ensure we get latest data
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching payment methods:', error)

    // Return fallback data if backend is unavailable
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'fallback-1',
          name: 'Transferencia Bancaria',
          slug: 'bank_transfer',
          description: 'Mercado Pago, Uala, Brubank, etc.',
          icon: 'Building2',
          isActive: true,
          displayOrder: 1,
        },
        {
          id: 'fallback-2',
          name: 'Criptomonedas',
          slug: 'crypto',
          description: 'USDT, BTC, ETH',
          icon: 'Wallet',
          isActive: true,
          displayOrder: 2,
        },
      ],
    })
  }
}
