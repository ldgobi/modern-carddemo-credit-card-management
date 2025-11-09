'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { creditCardService } from '@/services/creditCardService';
import {
  CreditCard,
  CreditCardSearchCriteria,
  maskCardNumber,
  formatActiveStatus,
  validateAccountId,
  validateCardNumber,
} from '@/types/creditCard';
import { Input, Button } from '@/components/ui';

export default function SearchCreditCardPage() {
  const router = useRouter();
  const [searchCriteria, setSearchCriteria] = useState<CreditCardSearchCriteria>({
    accountId: '',
    cardNumber: '',
  });
  const [card, setCard] = useState<CreditCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [searched, setSearched] = useState(false);

  const handleAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setSearchCriteria({ ...searchCriteria, accountId: value });
    if (validationErrors.accountId) {
      setValidationErrors({ ...validationErrors, accountId: '' });
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setSearchCriteria({ ...searchCriteria, cardNumber: value });
    if (validationErrors.cardNumber) {
      setValidationErrors({ ...validationErrors, cardNumber: '' });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!searchCriteria.accountId && !searchCriteria.cardNumber) {
      errors.general = 'At least one search criterion (Account ID or Card Number) must be provided';
      setValidationErrors(errors);
      return false;
    }

    if (searchCriteria.accountId && !validateAccountId(searchCriteria.accountId)) {
      errors.accountId = 'Invalid account ID format (must be 11 digits)';
    }

    if (searchCriteria.cardNumber && !validateCardNumber(searchCriteria.cardNumber)) {
      errors.cardNumber = 'Invalid card number format (must be 16 digits)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCard(null);
      setSearched(true);

      const result = await creditCardService.searchCreditCard(searchCriteria);
      setCard(result);
    } catch (err: any) {
      console.error('Failed to search credit card:', err);
      setError(err.message || 'Failed to search credit card');
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchCriteria({ accountId: '', cardNumber: '' });
    setCard(null);
    setError(null);
    setValidationErrors({});
    setSearched(false);
  };

  const handleViewDetails = () => {
    if (card) {
      router.push(`/credit-cards/${card.cardNumber}`);
    }
  };

  const handleUpdateCard = () => {
    if (card) {
      router.push(`/credit-cards/${card.cardNumber}/edit`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Search Credit Card</h1>
        <Button variant="secondary" onClick={() => router.push('/credit-cards')}>
          Back to List
        </Button>
      </div>

      <form onSubmit={handleSearch} className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Criteria</h2>
        
        {validationErrors.general && (
          <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
            <p className="text-sm text-yellow-800">{validationErrors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              label="Account ID"
              value={searchCriteria.accountId}
              onChange={handleAccountIdChange}
              placeholder="Enter account ID (11 digits)"
              disabled={loading}
              maxLength={11}
            />
            {validationErrors.accountId && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.accountId}</p>
            )}
          </div>
          <div>
            <Input
              label="Card Number"
              value={searchCriteria.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="Enter card number (16 digits)"
              disabled={loading}
              maxLength={16}
            />
            {validationErrors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.cardNumber}</p>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          * At least one search criterion must be provided
        </p>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClear} disabled={loading}>
            Clear
          </Button>
        </div>
      </form>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-600">Searching for credit card...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && searched && !card && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg font-semibold mb-2">No Credit Card Found</p>
          <p className="text-gray-500">
            No credit card matches your search criteria. Please try different search parameters.
          </p>
        </div>
      )}

      {card && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Search Result</h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleViewDetails}>
                View Details
              </Button>
              <Button size="sm" variant="secondary" onClick={handleUpdateCard}>
                Update
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
              <p className="text-gray-900 font-mono text-lg">{maskCardNumber(card.cardNumber)}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account ID</label>
              <p className="text-gray-900 text-lg">{card.accountId}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Embossed Name</label>
              <p className="text-gray-900 text-lg">{card.embossedName}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  card.activeStatus === 'Y'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {formatActiveStatus(card.activeStatus)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expiration Date
              </label>
              <p className="text-gray-900 text-lg">{card.expirationDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
