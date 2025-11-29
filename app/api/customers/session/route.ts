import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth/cookies';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

/**
 * POST /api/customers/session
 * Create or retrieve customer session
 * Sets session token in httpOnly cookie for security
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

    if (!body.contactPreference || !['EMAIL', 'WHATSAPP'].includes(body.contactPreference)) {
      return NextResponse.json(
        { success: false, error: 'contactPreference must be EMAIL or WHATSAPP' },
        { status: 400 }
      );
    }

    // Validar que se proporcione el medio de contacto correcto
    if (body.contactPreference === 'EMAIL' && !body.email) {
      return NextResponse.json(
        { success: false, error: 'email is required for EMAIL preference' },
        { status: 400 }
      );
    }

    if (body.contactPreference === 'WHATSAPP' && !body.phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'phoneNumber is required for WHATSAPP preference' },
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
