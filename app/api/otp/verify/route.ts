import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/cookies';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

/**
 * POST /api/otp/verify
 * Verifica un código OTP
 * Sets session token in httpOnly cookie on successful verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación básica
    if (!body.identifier) {
      return NextResponse.json(
        { success: false, error: 'identifier is required' },
        { status: 400 }
      );
    }

    if (!body.type || !['EMAIL', 'WHATSAPP'].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: 'type must be EMAIL or WHATSAPP' },
        { status: 400 }
      );
    }

    if (!body.code || body.code.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'code must be 6 digits' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_SECRET!,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Extract session token and set it in httpOnly cookie
    const sessionToken = data.data?.sessionToken || data.sessionToken;

    if (sessionToken) {
      // Create response and set cookie
      const jsonResponse = NextResponse.json(data);
      return setSessionCookie(jsonResponse, sessionToken);
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
