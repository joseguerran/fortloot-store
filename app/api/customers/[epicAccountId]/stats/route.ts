import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

/**
 * GET /api/customers/[epicAccountId]/stats
 * Get customer statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { epicAccountId: string } }
) {
  try {
    const { epicAccountId } = params;

    if (!epicAccountId) {
      return NextResponse.json(
        { success: false, error: 'epicAccountId is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/customers/${encodeURIComponent(epicAccountId)}/stats`,
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
