import { NextRequest, NextResponse } from 'next/server';
import { forwardAuthRequest, handleAuthApiResponse } from '@/lib/auth-middleware';

// GET /api/credit-cards - List credit cards with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const cardNumber = searchParams.get('cardNumber');
    const page = searchParams.get('page') || '1';

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
    queryParams.append('page', page);

    const backendUrl = `/api/credit-cards?${queryParams.toString()}`;
    const response = await forwardAuthRequest(backendUrl, 'GET', request);
    const result = await handleAuthApiResponse(response);

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error fetching credit cards:', error);
    return NextResponse.json(
      { 
        status: 500,
        message: 'Failed to fetch credit cards',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/credit-cards - Create new credit card
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const errors: Record<string, string> = {};

    if (!body.cardNumber || !/^\d{16}$/.test(body.cardNumber)) {
      errors.cardNumber = 'Card number must be exactly 16 digits';
    }

    if (!body.accountId || !/^\d{11}$/.test(body.accountId)) {
      errors.accountId = 'Account ID must be exactly 11 digits';
    }

    if (!body.embossedName || !/^[A-Za-z\s]+$/.test(body.embossedName)) {
      errors.embossedName = 'Embossed name must contain only alphabets and spaces';
    }

    if (!body.cvvCode || !/^\d{3}$/.test(body.cvvCode)) {
      errors.cvvCode = 'CVV code must be exactly 3 digits';
    }

    if (!body.activeStatus || !['Y', 'N'].includes(body.activeStatus)) {
      errors.activeStatus = 'Active status must be Y or N';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { 
          status: 400,
          errors,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const response = await forwardAuthRequest('/api/credit-cards', 'POST', request, body);
    const result = await handleAuthApiResponse(response);

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error creating credit card:', error);
    return NextResponse.json(
      { 
        status: 500,
        message: 'Failed to create credit card',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
