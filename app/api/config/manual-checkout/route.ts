import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

/**
 * GET /api/config/manual-checkout
 * Obtiene el estado de manual checkout enabled desde el backend
 */
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/config/manual-checkout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_SECRET!,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('Failed to fetch manual checkout config from backend, using default');
      return NextResponse.json({
        success: true,
        enabled: false,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      enabled: data.enabled || false,
      value: data.enabled || false,
    });
  } catch (error) {
    console.error('Error fetching manual checkout config:', error);
    // Fallback a false en caso de error
    return NextResponse.json({
      success: true,
      enabled: false,
    });
  }
}
