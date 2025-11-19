import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

/**
 * POST /api/customers/session
 * Create or retrieve customer session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Server-side validation
    if (!body.epicAccountId) {
      return NextResponse.json(
        { success: false, error: 'epicAccountId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/customers/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_SECRET!,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error creating session:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating session:', error);
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
