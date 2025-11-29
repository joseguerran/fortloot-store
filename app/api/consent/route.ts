/**
 * API Route: /api/consent
 * Proxy para registrar consentimientos de cookies en el backend
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/api/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward client IP for proper hashing
        'X-Forwarded-For': request.headers.get('x-forwarded-for') ||
                           request.headers.get('x-real-ip') ||
                           'unknown',
        // Forward User-Agent
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error proxying consent request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record consent' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/consent/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching consent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch consent' },
      { status: 500 }
    );
  }
}
