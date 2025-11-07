import {
  CreditCard,
  CreditCardListResponse,
  SearchCreditCardParams,
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

  async getCreditCards(params?: SearchCreditCardParams): Promise<CreditCardListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.accountId) {
      if (!validateAccountId(params.accountId)) {
        throw new Error('Account ID must be exactly 11 digits');
      }
      queryParams.append('accountId', params.accountId);
    }

    if (params?.cardNumber) {
      if (!validateCardNumber(params.cardNumber)) {
        throw new Error('Card number must be exactly 16 digits');
      }
      queryParams.append('cardNumber', params.cardNumber);
    }

    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const url = queryParams.toString()
      ? `${API_BASE_URL}/credit-cards?${queryParams.toString()}`
      : `${API_BASE_URL}/credit-cards`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credit cards');
    }

    return response.json();
  }

  async getCreditCardByCardNumber(cardNumber: string): Promise<CreditCard> {
    if (!validateCardNumber(cardNumber)) {
      throw new Error('Card number must be exactly 16 digits');
    }

    const response = await fetch(`${API_BASE_URL}/credit-cards/${cardNumber}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch credit card');
    }

    return response.json();
  }

  async createCreditCard(data: {
    cardNumber: string;
    accountId: string;
    embossedName: string;
    cvvCode: string;
    expirationDate: string;
    activeStatus: 'Y' | 'N';
  }): Promise<CreditCard> {
    if (!validateCardNumber(data.cardNumber)) {
      throw new Error('Card number must be exactly 16 digits');
    }

    if (!validateAccountId(data.accountId)) {
      throw new Error('Account ID must be exactly 11 digits');
    }

    const response = await fetch(`${API_BASE_URL}/credit-cards`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create credit card');
    }

    return response.json();
  }

  async updateCreditCard(
    cardNumber: string,
    data: {
      cardNumber: string;
      accountId: string;
      embossedName?: string;
      activeStatus?: 'Y' | 'N';
      expirationMonth?: number;
      expirationYear?: number;
    }
  ): Promise<CreditCard> {
    if (!validateCardNumber(cardNumber)) {
      throw new Error('Card number must be exactly 16 digits');
    }

    const response = await fetch(`${API_BASE_URL}/credit-cards/${cardNumber}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update credit card');
    }

    return response.json();
  }

  async deleteCreditCard(cardNumber: string): Promise<void> {
    if (!validateCardNumber(cardNumber)) {
      throw new Error('Card number must be exactly 16 digits');
    }

    const response = await fetch(`${API_BASE_URL}/credit-cards/${cardNumber}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete credit card');
    }
  }

  async searchCreditCards(params: SearchCreditCardParams): Promise<CreditCard> {
    const queryParams = new URLSearchParams();

    if (params?.accountId) {
      if (!validateAccountId(params.accountId)) {
        throw new Error('Account ID must be exactly 11 digits');
      }
      queryParams.append('accountId', params.accountId);
    }

    if (params?.cardNumber) {
      if (!validateCardNumber(params.cardNumber)) {
        throw new Error('Card number must be exactly 16 digits');
      }
      queryParams.append('cardNumber', params.cardNumber);
    }

    const url = `${API_BASE_URL}/credit-cards/search?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search credit cards');
    }

    return response.json();
  }
}

export const creditCardService = new CreditCardService();
