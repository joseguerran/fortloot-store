import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

/**
 * GET /api/customers/verify-friendship?epicAccountId=xxx
 * Verify if customer has friendship with bots
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const epicAccountId = searchParams.get('epicAccountId');

    if (!epicAccountId) {
      return NextResponse.json(
        { success: false, error: 'epicAccountId query parameter is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/customers/verify-friendship?epicAccountId=${encodeURIComponent(epicAccountId)}`,
      {
        headers: {
          'x-api-key': API_SECRET!,
        },
      }
    );

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
