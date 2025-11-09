'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { creditCardService } from '@/services/creditCardService';
import {
  CreditCardListResponse,
  maskCardNumber,
  formatActiveStatus,
  validateAccountId,
  validateCardNumber,
} from '@/types/creditCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui';
import { Button, Input } from '@/components/ui';

export default function CreditCardsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [accountIdFilter, setAccountIdFilter] = useState('');
  const [cardNumberFilter, setCardNumberFilter] = useState('');
  const [accountIdError, setAccountIdError] = useState<string | null>(null);
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);

  useEffect(() => {
    const accountId = searchParams.get('accountId') || '';
    const cardNumber = searchParams.get('cardNumber') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    setAccountIdFilter(accountId);
    setCardNumberFilter(cardNumber);
    setCurrentPage(page);

    fetchCreditCards(accountId, cardNumber, page);
  }, [searchParams]);

  const fetchCreditCards = async (accountId: string, cardNumber: string, page: number) => {
    try {
      setLoading(true);
      setError(null);
      setAccountIdError(null);
      setCardNumberError(null);

      const response: CreditCardListResponse = await creditCardService.getCreditCards({
        accountId: accountId || undefined,
        cardNumber: cardNumber || undefined,
        page,
      });

      setCards(response.cards);
      setCurrentPage(response.currentPage);
      setHasNextPage(response.hasNextPage);
      setHasPreviousPage(response.hasPreviousPage);
    } catch (err: any) {
      console.error('Failed to load credit cards:', err);
      setError(err.message || 'Failed to load credit cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setAccountIdFilter(value);
    setAccountIdError(null);

    if (value && value.length > 11) {
      setAccountIdError('Account ID must be 11 digits');
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardNumberFilter(value);
    setCardNumberError(null);

    if (value && value.length > 16) {
      setCardNumberError('Card number must be 16 digits');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    if (accountIdFilter && !validateAccountId(accountIdFilter)) {
      setAccountIdError('Invalid account ID format (must be 11 digits)');
      hasError = true;
    }

    if (cardNumberFilter && !validateCardNumber(cardNumberFilter)) {
      setCardNumberError('Invalid card number format (must be 16 digits)');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    updateUrlParams(accountIdFilter, cardNumberFilter, 1);
  };

  const handleClearFilters = () => {
    setAccountIdFilter('');
    setCardNumberFilter('');
    setAccountIdError(null);
    setCardNumberError(null);
    updateUrlParams('', '', 1);
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      updateUrlParams(accountIdFilter, cardNumberFilter, currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      updateUrlParams(accountIdFilter, cardNumberFilter, currentPage + 1);
    }
  };

  const updateUrlParams = (accountId: string, cardNumber: string, page: number) => {
    const params = new URLSearchParams();
    if (accountId) params.set('accountId', accountId);
    if (cardNumber) params.set('cardNumber', cardNumber);
    if (page > 1) params.set('page', page.toString());

    const queryString = params.toString();
    router.push(`/credit-cards${queryString ? `?${queryString}` : ''}`);
  };

  const handleViewDetails = (card: any) => {
    router.push(`/credit-cards/${card.cardNumber}`);
  };

  const handleUpdateCard = (card: any) => {
    router.push(`/credit-cards/${card.cardNumber}/edit`);
  };

  const hasFilters = accountIdFilter || cardNumberFilter;
  const hasValidationErrors = accountIdError || cardNumberError;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Credit Cards</h1>
        <Button onClick={() => router.push('/credit-cards/search')}>
          Search Card
        </Button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              label="Account ID"
              value={accountIdFilter}
              onChange={handleAccountIdChange}
              placeholder="Enter account ID (11 digits)"
              disabled={loading}
              maxLength={11}
            />
            {accountIdError && (
              <p className="mt-1 text-sm text-red-600">{accountIdError}</p>
            )}
          </div>
          <div>
            <Input
              label="Card Number"
              value={cardNumberFilter}
              onChange={handleCardNumberChange}
              placeholder="Enter card number (16 digits)"
              disabled={loading}
              maxLength={16}
            />
            {cardNumberError && (
              <p className="mt-1 text-sm text-red-600">{cardNumberError}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading || hasValidationErrors}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-600">Loading credit cards...</p>
          </div>
        </div>
      )}

      {!loading && !error && cards.length === 0 && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg font-semibold mb-2">No Credit Cards Found</p>
          <p className="text-gray-500">
            {hasFilters
              ? 'No credit cards match your search criteria. Try adjusting your filters.'
              : 'There are no credit cards to display.'}
          </p>
        </div>
      )}

      {!loading && !error && cards.length > 0 && (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Card Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cards.map((card, index) => (
                  <TableRow key={index}>
                    <TableCell>{card.accountId}</TableCell>
                    <TableCell>
                      <span className="font-mono">{maskCardNumber(card.cardNumber)}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          card.activeStatus === 'Y'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {formatActiveStatus(card.activeStatus)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(card)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateCard(card)}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-700">
              Page <span className="font-semibold">{currentPage}</span> - Showing{' '}
              <span className="font-semibold">{cards.length}</span> cards
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage || loading}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={!hasNextPage || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
