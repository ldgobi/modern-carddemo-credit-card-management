import { NextRequest, NextResponse } from 'next/server';
import { forwardAuthRequest, handleAuthApiResponse } from '@/lib/auth-middleware';

// GET /api/credit-cards/search - Search for credit card by account ID and/or card number
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const cardNumber = searchParams.get('cardNumber');

    // At least one search criterion must be provided
    if (!accountId && !cardNumber) {
      return NextResponse.json(
        { error: 'At least one search criterion (accountId or cardNumber) must be provided' },
        { status: 400 }
      );
    }

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (accountId) queryParams.append('accountId', accountId);
    if (cardNumber) queryParams.append('cardNumber', cardNumber);

    const backendUrl = `/api/credit-cards/search?${queryParams.toString()}`;
    
    const response = await forwardAuthRequest(backendUrl, 'GET', request);
    const result = await handleAuthApiResponse(response);
    
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error searching credit card:', error);
    return NextResponse.json(
      { error: 'Failed to search credit card' },
      { status: 500 }
    );
  }
}
