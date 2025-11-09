import { NextRequest, NextResponse } from 'next/server';
import { forwardAuthRequest, handleAuthApiResponse } from '@/lib/auth-middleware';

// GET /api/credit-cards/:cardNumber - Get credit card by card number
export async function GET(
  request: NextRequest,
  { params }: { params: { cardNumber: string } }
) {
  try {
    const { cardNumber } = params;

    // Validate card number
    if (!/^\d{16}$/.test(cardNumber)) {
      return NextResponse.json(
        { 
          status: 400,
          message: 'Invalid card number format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const response = await forwardAuthRequest(
      `/api/credit-cards/${cardNumber}`,
      'GET',
      request
    );
    const result = await handleAuthApiResponse(response);

    if (result.status === 404) {
      return NextResponse.json(
        { 
          status: 404,
          message: 'Credit card not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error fetching credit card:', error);
    return NextResponse.json(
      { 
        status: 500,
        message: 'Failed to fetch credit card',
        timestamp: new Date().toISOString()
      },
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
    const { cardNumber } = params;
    const body = await request.json();

    // Validate card number
    if (!/^\d{16}$/.test(cardNumber)) {
      return NextResponse.json(
        { 
          status: 400,
          message: 'Invalid card number format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate card number match
    if (body.cardNumber && body.cardNumber !== cardNumber) {
      return NextResponse.json(
        { 
          status: 400,
          message: 'Card number in path must match card number in request body',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate update fields
    const errors: Record<string, string> = {};

    if (body.embossedName && !/^[A-Za-z\s]+$/.test(body.embossedName)) {
      errors.embossedName = 'Embossed name must contain only alphabets and spaces';
    }

    if (body.embossedName && body.embossedName.length > 50) {
      errors.embossedName = 'Embossed name must not exceed 50 characters';
    }

    if (body.activeStatus && !['Y', 'N'].includes(body.activeStatus)) {
      errors.activeStatus = 'Active status must be Y or N';
    }

    if (body.expirationMonth !== undefined) {
      const month = Number(body.expirationMonth);
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        errors.expirationMonth = 'Expiration month must be between 1 and 12';
      }
    }

    if (body.expirationYear !== undefined) {
      const year = Number(body.expirationYear);
      if (!Number.isInteger(year) || year < 1950 || year > 2099) {
        errors.expirationYear = 'Expiration year must be between 1950 and 2099';
      }
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

    const response = await forwardAuthRequest(
      `/api/credit-cards/${cardNumber}`,
      'PUT',
      request,
      body
    );
    const result = await handleAuthApiResponse(response);

    if (result.status === 404) {
      return NextResponse.json(
        { 
          status: 404,
          message: 'Credit card not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    if (result.status === 409) {
      return NextResponse.json(
        { 
          status: 409,
          message: 'Card was modified by another user (concurrent modification)',
          timestamp: new Date().toISOString()
        },
        { status: 409 }
      );
    }

    return NextResponse.json(result.data, { status: result.status });
  } catch (error) {
    console.error('Error updating credit card:', error);
    return NextResponse.json(
      { 
        status: 500,
        message: 'Failed to update credit card',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// DELETE /api/credit-cards/:cardNumber - Delete credit card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cardNumber: string } }
) {
  try {
    const { cardNumber } = params;

    // Validate card number
    if (!/^\d{16}$/.test(cardNumber)) {
      return NextResponse.json(
        { 
          status: 400,
          message: 'Invalid card number format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const response = await forwardAuthRequest(
      `/api/credit-cards/${cardNumber}`,
      'DELETE',
      request
    );
    const result = await handleAuthApiResponse(response);

    if (result.status === 404) {
      return NextResponse.json(
        { 
          status: 404,
          message: 'Credit card not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Credit card deleted successfully' },
      { status: result.status }
    );
  } catch (error) {
    console.error('Error deleting credit card:', error);
    return NextResponse.json(
      { 
        status: 500,
        message: 'Failed to delete credit card',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
