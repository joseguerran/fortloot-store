import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.API_URL || 'http://localhost:3001/api';
const API_SECRET = process.env.API_SECRET;

/**
 * GET /api/config/checkout-mode
 * Obtiene el modo de checkout actual desde el backend
 */
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/config/checkout-mode`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_SECRET!,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Si el backend no responde o falla, retornar whatsapp por defecto
      console.warn('Backend config API not available, defaulting to whatsapp mode');
      return NextResponse.json({
        value: 'whatsapp',
        source: 'default'
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // En caso de error, retornar whatsapp por defecto
    console.error('Error fetching checkout mode:', error);
    return NextResponse.json({
      value: 'whatsapp',
      source: 'default',
      error: 'Backend not available'
    });
  }
}

/**
 * PUT /api/config/checkout-mode
 * Actualiza el modo de checkout (para uso desde backoffice)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { value } = body;

    // Validar que el valor sea válido
    if (!['whatsapp', 'wizard', 'bot-wizard'].includes(value)) {
      return NextResponse.json(
        { error: 'Invalid checkout mode. Must be: whatsapp, wizard, or bot-wizard' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/config/checkout-mode`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_SECRET!,
      },
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to update checkout mode', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating checkout mode:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
