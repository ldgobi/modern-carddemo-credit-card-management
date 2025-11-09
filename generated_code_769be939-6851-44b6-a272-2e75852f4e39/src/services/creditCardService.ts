import {
  CreditCard,
  CreditCardListResponse,
  CreditCardListParams,
  UpdateCreditCardRequest,
  CreditCardSearchCriteria,
  validateCardNumber,
  validateAccountId,
} from '@/types/creditCard';

const API_BASE_URL = '/api';

class CreditCardService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getCreditCards(params?: CreditCardListParams): Promise<CreditCardListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.accountId) {
      if (!validateAccountId(params.accountId)) {
        throw new Error('Invalid account ID format (must be 11 digits)');
      }
      queryParams.append('accountId', params.accountId);
    }

    if (params?.cardNumber) {
      if (!validateCardNumber(params.cardNumber)) {
        throw new Error('Invalid card number format (must be 16 digits)');
      }
      queryParams.append('cardNumber', params.cardNumber);
    }

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/credit-cards${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid request parameters');
      }
      if (response.status === 404) {
        throw new Error('No credit cards found');
      }
      throw new Error('Failed to fetch credit cards');
    }

    return response.json();
  }

  async getCreditCardByNumber(cardNumber: string): Promise<CreditCard> {
    if (!validateCardNumber(cardNumber)) {
      throw new Error('Invalid card number format (must be 16 digits)');
    }

    const response = await fetch(`${API_BASE_URL}/credit-cards/${cardNumber}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Credit card not found');
      }
      if (response.status === 400) {
        throw new Error('Invalid card number');
      }
      throw new Error('Failed to fetch credit card');
    }

    return response.json();
  }

  async searchCreditCard(criteria: CreditCardSearchCriteria): Promise<CreditCard> {
    if (!criteria.accountId && !criteria.cardNumber) {
      throw new Error('At least one search criterion must be provided');
    }

    const queryParams = new URLSearchParams();

    if (criteria.accountId) {
      if (!validateAccountId(criteria.accountId)) {
        throw new Error('Invalid account ID format (must be 11 digits)');
      }
      queryParams.append('accountId', criteria.accountId);
    }

    if (criteria.cardNumber) {
      if (!validateCardNumber(criteria.cardNumber)) {
        throw new Error('Invalid card number format (must be 16 digits)');
      }
      queryParams.append('cardNumber', criteria.cardNumber);
    }

    const response = await fetch(
      `${API_BASE_URL}/credit-cards/search?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No credit card found matching the criteria');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid search criteria');
      }
      throw new Error('Failed to search credit card');
    }

    return response.json();
  }

  async updateCreditCard(
    cardNumber: string,
    data: UpdateCreditCardRequest
  ): Promise<CreditCard> {
    if (!validateCardNumber(cardNumber)) {
      throw new Error('Invalid card number format (must be 16 digits)');
    }

    // Validate update data
    if (data.embossedName && !/^[a-zA-Z\s]+$/.test(data.embossedName)) {
      throw new Error('Card name must contain only alphabets and spaces');
    }

    if (data.activeStatus && !['Y', 'N'].includes(data.activeStatus)) {
      throw new Error('Active status must be Y or N');
    }

    if (data.expirationMonth && (data.expirationMonth < 1 || data.expirationMonth > 12)) {
      throw new Error('Expiration month must be between 1 and 12');
    }

    if (data.expirationYear && (data.expirationYear < 1950 || data.expirationYear > 2099)) {
      throw new Error('Expiration year must be between 1950 and 2099');
    }

    const response = await fetch(`${API_BASE_URL}/credit-cards/${cardNumber}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Credit card not found');
      }
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid update data');
      }
      if (response.status === 409) {
        throw new Error('Card was modified by another user. Please refresh and try again.');
      }
      throw new Error('Failed to update credit card');
    }

    return response.json();
  }

  async getNextPage(currentPage: number, params?: CreditCardListParams): Promise<CreditCardListResponse> {
    return this.getCreditCards({
      ...params,
      page: currentPage + 1,
    });
  }

  async getPreviousPage(currentPage: number, params?: CreditCardListParams): Promise<CreditCardListResponse> {
    if (currentPage <= 1) {
      throw new Error('Already on first page');
    }
    return this.getCreditCards({
      ...params,
      page: currentPage - 1,
    });
  }
}

export const creditCardService = new CreditCardService();
