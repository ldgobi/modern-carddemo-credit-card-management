import { NextRequest, NextResponse } from 'next/server';
import { forwardAuthRequest, handleAuthApiResponse } from '@/lib/auth-middleware';

// GET /api/credit-cards/:cardNumber - Get credit card details by card number
export async function GET(
  request: NextRequest,
  { params }: { params: { cardNumber: string } }
) {
  try {
    const response = await forwardAuthRequest(
      `/api/credit-cards/${params.cardNumber}`,
      'GET',
      request
    );
    const result = await handleAuthApiResponse(response);
    
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error fetching credit card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit card' },
      { status: 500 }
    );
  }
}

// PUT /api/credit-cards/:cardNumber - Update credit card
export async function PUT(
  request: NextRequest,
  { params }: { params: { cardNumber: string } }
) {
  try {
    const body = await request.json();
    
    // Validate that card number in path matches body
    if (body.cardNumber && body.cardNumber !== params.cardNumber) {
      return NextResponse.json(
        { error: 'Card number in path must match card number in request body' },
        { status: 400 }
      );
    }
    
    const response = await forwardAuthRequest(
      `/api/credit-cards/${params.cardNumber}`,
      'PUT',
      request,
      body
    );
    const result = await handleAuthApiResponse(response);
    
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error updating credit card:', error);
    return NextResponse.json(
      { error: 'Failed to update credit card' },
      { status: 500 }
    );
  }
}
