import { NextRequest, NextResponse } from 'next/server';

// Limite de tamaño de archivo: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const formData = await request.formData();

    // Validar tamaño del archivo antes de enviarlo al backend
    const file = formData.get('proof') as File | null;
    if (file && file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'FILE_TOO_LARGE',
          message: 'El archivo es muy grande. El tamaño máximo es 5MB.',
        },
        { status: 413 }
      );
    }

    // Get backend URL from environment
    const apiUrl = process.env.API_URL || 'http://localhost:3001/api';

    // API_URL already includes /api, so we use it directly
    const url = `${apiUrl}/payments/orders/${orderId}/proof`;

    // Forward the form data to the backend
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'x-api-key': process.env.API_SECRET || '',
      },
      // Don't set Content-Type header - let fetch set it with boundary for multipart/form-data
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'UPLOAD_ERROR',
        message: 'Error al subir el comprobante de pago. Por favor, inténtalo de nuevo.',
      },
      { status: 500 }
    );
  }
}
