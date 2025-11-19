import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

if (!API_SECRET) {
  console.error('⚠️ API_SECRET is not configured! All requests will fail.');
}

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Server-side validation
    if (!body.customerId || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order data: customerId and items are required' },
        { status: 400 }
      );
    }

    // Call backend with API_SECRET
    const response = await fetch(`${BACKEND_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_SECRET!,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error creating order:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders?customerId=xxx
 * Get orders for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'customerId query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/orders/customer/${encodeURIComponent(customerId)}`,
      {
        headers: {
          'x-api-key': API_SECRET!,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error fetching orders:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
