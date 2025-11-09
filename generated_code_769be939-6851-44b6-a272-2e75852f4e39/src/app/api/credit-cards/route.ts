import { NextRequest, NextResponse } from 'next/server';
import { forwardAuthRequest, handleAuthApiResponse } from '@/lib/auth-middleware';

// GET /api/credit-cards - List credit cards with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const cardNumber = searchParams.get('cardNumber');
    const page = searchParams.get('page') || '1';

    // Build query string for backend
    const queryParams = new URLSearchParams();
    if (accountId) queryParams.append('accountId', accountId);
    if (cardNumber) queryParams.append('cardNumber', cardNumber);
    queryParams.append('page', page);

    const backendUrl = `/api/credit-cards?${queryParams.toString()}`;
    
    const response = await forwardAuthRequest(backendUrl, 'GET', request);
    const result = await handleAuthApiResponse(response);
    
    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit cards' },
      { status: 500 }
    );
  }
}
