import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const formData = await request.formData();

    // Get backend URL from environment
    const apiUrl = process.env.API_URL || 'http://localhost:3001/api';

    // API_URL already includes /api, so we use it directly
    const url = `${apiUrl}/payments/orders/${orderId}/proof`;
    console.log('Uploading payment proof to:', url);
    console.log('Using API key:', process.env.API_SECRET ? 'present' : 'missing');

    // Forward the form data to the backend
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'x-api-key': process.env.API_SECRET || '',
      },
      // Don't set Content-Type header - let fetch set it with boundary for multipart/form-data
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading payment proof:', error);
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
