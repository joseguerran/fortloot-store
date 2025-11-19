import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

/**
 * GET /api/orders/[orderId]
 * Get order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        'x-api-key': API_SECRET!,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error fetching order:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order:', error);
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
 * PATCH /api/orders/[orderId]/cancel
 * Cancel order
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const url = new URL(request.url);

    // Check if this is a cancel request
    if (url.pathname.endsWith('/cancel')) {
      const response = await fetch(
        `${BACKEND_URL}/orders/${encodeURIComponent(orderId)}/cancel`,
        {
          method: 'POST',
          headers: {
            'x-api-key': API_SECRET!,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Backend error canceling order:', data);
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid operation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error canceling order:', error);
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
