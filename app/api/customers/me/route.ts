import { NextRequest, NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth/cookies';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';

/**
 * GET /api/customers/me
 * Get current customer data using session token
 * This is the secure endpoint for fetching customer data
 * Reads token from httpOnly cookie (primary) or Authorization header (fallback)
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get token from httpOnly cookie first (secure method)
    let sessionToken = await getSessionToken();

    // Fallback to Authorization header for backwards compatibility
    if (!sessionToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
      }
    }

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Session token required' },
        { status: 401 }
      );
    }

    // Forward the request to backend with the session token
    const response = await fetch(`${BACKEND_URL}/customers/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
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
