export interface CreditCard {
  cardNumber: string;
  accountId: string;
  embossedName: string;
  cvvCode: string;
  expirationDate: string;
  activeStatus: 'Y' | 'N';
}

export interface CreditCardSearchCriteria {
  accountId?: string;
  cardNumber?: string;
}

export interface UpdateCreditCardRequest {
  cardNumber: string;
  accountId: string;
  embossedName: string;
  activeStatus: 'Y' | 'N';
  expirationMonth: number;
  expirationYear: number;
}

export interface CreditCardListResponse {
  cards: Array<{
    cardNumber: string;
    accountId: string;
    activeStatus: 'Y' | 'N';
  }>;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalRecordsOnPage: number;
}

export interface CreditCardListParams {
  accountId?: string;
  cardNumber?: string;
  page?: number;
}

// Validation functions
export function validateCardNumber(cardNumber: string): boolean {
  if (!cardNumber) return false;
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
}

export function validateAccountId(accountId: string): boolean {
  if (!accountId) return false;
  const cleaned = accountId.replace(/\s/g, '');
  return /^\d{11}$/.test(cleaned);
}

export function validateEmbossedName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 50) return false;
  return /^[a-zA-Z\s]+$/.test(name);
}

export function validateExpirationMonth(month: number): boolean {
  return month >= 1 && month <= 12;
}

export function validateExpirationYear(year: number): boolean {
  return year >= 1950 && year <= 2099;
}

export function validateActiveStatus(status: string): boolean {
  return status === 'Y' || status === 'N';
}

// Formatting functions
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.replace(/(\d{4})/g, '$1 ').trim();
}

export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length !== 16) return cardNumber;
  return `**** **** **** ${cleaned.slice(-4)}`;
}

export function formatExpirationDate(month: number, year: number): string {
  const monthStr = month.toString().padStart(2, '0');
  return `${monthStr}/${year}`;
}

export function formatActiveStatus(status: 'Y' | 'N'): string {
  return status === 'Y' ? 'Active' : 'Inactive';
}

export function getStatusColor(status: 'Y' | 'N'): string {
  return status === 'Y' ? 'text-green-600' : 'text-gray-600';
}

export function getStatusBadgeColor(status: 'Y' | 'N'): string {
  return status === 'Y' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-gray-100 text-gray-800';
}
