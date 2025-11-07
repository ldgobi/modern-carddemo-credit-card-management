export interface CreditCard {
  cardNumber: string;
  accountId: string;
  embossedName: string;
  cvvCode: string;
  expirationDate: string;
  activeStatus: 'Y' | 'N';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCreditCardRequest {
  cardNumber: string;
  accountId: string;
  embossedName: string;
  cvvCode: string;
  expirationDate: string;
  activeStatus: 'Y' | 'N';
}

export interface UpdateCreditCardRequest {
  embossedName?: string;
  activeStatus?: 'Y' | 'N';
  expirationMonth?: number;
  expirationYear?: number;
}

export interface CreditCardListResponse {
  cards: CreditCard[];
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalRecordsOnPage: number;
}

export interface SearchCreditCardParams {
  accountId?: string;
  cardNumber?: string;
  page?: number;
}

export const CARD_NUMBER_LENGTH = 16;
export const ACCOUNT_ID_LENGTH = 11;
export const EMBOSSED_NAME_MAX_LENGTH = 50;
export const CVV_CODE_LENGTH = 3;
export const MIN_EXPIRATION_MONTH = 1;
export const MAX_EXPIRATION_MONTH = 12;
export const MIN_EXPIRATION_YEAR = 1950;
export const MAX_EXPIRATION_YEAR = 2099;

export const ACTIVE_STATUS_LABELS: Record<'Y' | 'N', string> = {
  Y: 'Active',
  N: 'Inactive',
};

export const ACTIVE_STATUS_OPTIONS = [
  { value: 'Y', label: 'Active' },
  { value: 'N', label: 'Inactive' },
];

export function validateCardNumber(cardNumber: string): boolean {
  return /^\d{16}$/.test(cardNumber);
}

export function validateAccountId(accountId: string): boolean {
  return /^\d{11}$/.test(accountId);
}

export function validateEmbossedName(name: string): boolean {
  if (!name || name.length === 0 || name.length > EMBOSSED_NAME_MAX_LENGTH) {
    return false;
  }
  return /^[A-Za-z\s]+$/.test(name);
}

export function validateCvvCode(cvvCode: string): boolean {
  return /^\d{3}$/.test(cvvCode);
}

export function validateActiveStatus(status: string): boolean {
  return status === 'Y' || status === 'N';
}

export function validateExpirationMonth(month: number): boolean {
  return Number.isInteger(month) && month >= MIN_EXPIRATION_MONTH && month <= MAX_EXPIRATION_MONTH;
}

export function validateExpirationYear(year: number): boolean {
  return Number.isInteger(year) && year >= MIN_EXPIRATION_YEAR && year <= MAX_EXPIRATION_YEAR;
}

export function validateExpirationDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length !== CARD_NUMBER_LENGTH) {
    return cardNumber;
  }
  return `**** **** **** ${cardNumber.slice(-4)}`;
}

export function formatExpirationDate(dateString: string): string {
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
}

export function parseExpirationDate(dateString: string): { month: number; year: number; day: number } {
  const date = new Date(dateString);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    day: date.getDate(),
  };
}

export function createExpirationDate(month: number, year: number): string {
  const monthStr = month.toString().padStart(2, '0');
  return `${year}-${monthStr}-01`;
}

export function isCardExpired(dateString: string): boolean {
  const expirationDate = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return expirationDate < now;
}

export function getCardStatusColor(status: 'Y' | 'N'): string {
  return status === 'Y' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
}

export function getCardStatusBadge(status: 'Y' | 'N'): string {
  return status === 'Y' ? 'Active' : 'Inactive';
}

export function sanitizeEmbossedName(name: string): string {
  return name.replace(/[^A-Za-z\s]/g, '').trim();
}

export function formatAccountId(accountId: string): string {
  if (accountId.length !== ACCOUNT_ID_LENGTH) {
    return accountId;
  }
  return `${accountId.slice(0, 3)}-${accountId.slice(3, 7)}-${accountId.slice(7)}`;
}
