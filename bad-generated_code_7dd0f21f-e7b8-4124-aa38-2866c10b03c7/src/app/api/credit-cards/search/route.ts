import { NextRequest, NextResponse } from 'next/server';
import { forwardAuthRequest, handleAuthApiResponse } from '@/lib/auth-middleware';

// GET /api/credit-cards/search - Search for a credit card
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const cardNumber = searchParams.get('cardNumber');

    // At least one search criterion must be provided
    if (!accountId && !cardNumber) {
      return NextResponse.json(
        { 
          status: 400,
          message: 'At least one search criterion required (accountId or cardNumber)',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate accountId if provided
    if (accountId && !/^\d{11}$/.test(accountId)) {
      return NextResponse.json(
        { 
          status: 400,
          errors: { accountId: 'Account ID must be exactly 11 digits' },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate cardNumber if provided
    if (cardNumber && !/^\d{16}$/.test(cardNumber)) {
      return NextResponse.json(
        { 
          status: 400,
          errors: { cardNumber: 'Card number must be exactly 16 digits' },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Build query string for backend API
    const queryParams = new URLSearchParams();
    if (accountId) queryParams.append('accountId', accountId);
    if (cardNumber) queryParams.append('cardNumber', cardNumber);

    const backendUrl = `/api/credit-cards/search?${queryParams.toString()}`;
    const response = await forwardAuthRequest(backendUrl, 'GET', request);
    const result = await handleAuthApiResponse(response);

    if (result.status === 404) {
      return NextResponse.json(
        { 
          status: 404,
          message: 'No credit card found matching the criteria',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error searching credit cards:', error);
    return NextResponse.json(
      { 
        status: 500,
        message: 'Failed to search credit cards',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
