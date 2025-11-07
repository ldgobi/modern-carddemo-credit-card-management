'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { creditCardService } from '@/services/creditCardService';
import {
  CreditCard,
  CreditCardListResponse,
  SearchCreditCardParams,
  maskCardNumber,
  formatAccountId,
  ACTIVE_STATUS_LABELS,
  validateCardNumber,
  validateAccountId,
} from '@/types/creditCard';
import { Table, Button, Input } from '@/components/ui';

const RECORDS_PER_PAGE = 7;

export default function CreditCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  
  const [accountIdFilter, setAccountIdFilter] = useState('');
  const [cardNumberFilter, setCardNumberFilter] = useState('');
  const [accountIdError, setAccountIdError] = useState<string | null>(null);
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F7' && hasPrevious) {
        e.preventDefault();
        handlePreviousPage();
      } else if (e.key === 'F8' && hasNext) {
        e.preventDefault();
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrevious, hasNext, currentPage]);

  const updateDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    setCurrentDateTime(`${dateStr} ${timeStr}`);
  };

  const validateFilters = (): boolean => {
    let isValid = true;
    setAccountIdError(null);
    setCardNumberError(null);

    if (accountIdFilter && !validateAccountId(accountIdFilter)) {
      setAccountIdError('Account ID must be exactly 11 digits');
      isValid = false;
    }

    if (cardNumberFilter && !validateCardNumber(cardNumberFilter)) {
      setCardNumberError('Card number must be exactly 16 digits');
      isValid = false;
    }

    if (!accountIdFilter && !cardNumberFilter) {
      setError('Please enter at least one search criteria (Account ID or Card Number)');
      isValid = false;
    }

    return isValid;
  };

  const fetchCards = async (page: number) => {
    if (!validateFilters()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params: SearchCreditCardParams = {
        page,
      };

      if (accountIdFilter) {
        params.accountId = accountIdFilter;
      }

      if (cardNumberFilter) {
        params.cardNumber = cardNumberFilter;
      }

      const data: CreditCardListResponse = await creditCardService.getCreditCards(params);

      setCards(data.cards);
      setCurrentPage(data.currentPage);
      setHasNext(data.hasNextPage);
      setHasPrevious(data.hasPreviousPage);
      setTotalRecords(data.totalRecordsOnPage);
      setHasSearched(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load credit cards';
      setError(errorMessage);
      console.error('Failed to load credit cards:', err);
      setCards([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCards(1);
  };

  const handleClearFilters = () => {
    setAccountIdFilter('');
    setCardNumberFilter('');
    setAccountIdError(null);
    setCardNumberError(null);
    setError(null);
    setCards([]);
    setHasSearched(false);
    setCurrentPage(1);
    setHasNext(false);
    setHasPrevious(false);
    setTotalRecords(0);
  };

  const handleNextPage = () => {
    if (hasNext) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCards(nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchCards(prevPage);
    }
  };

  const handleViewCard = (cardNumber: string) => {
    router.push(`/credit-cards/${cardNumber}`);
  };

  const handleEditCard = (cardNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/credit-cards/${cardNumber}/edit`);
  };

  const handleAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setAccountIdFilter(value);
    if (accountIdError) {
      setAccountIdError(null);
    }
    if (error) {
      setError(null);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumberFilter(value);
    if (cardNumberError) {
      setCardNumberError(null);
    }
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">COCRDC01</h1>
              <span className="text-sm text-gray-600">CC01</span>
            </div>
            <span className="text-sm text-gray-600">{currentDateTime}</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Credit Card List</h2>
        </div>

        <form onSubmit={handleSearch} className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Input
                label="Account ID (11 digits)"
                value={accountIdFilter}
                onChange={handleAccountIdChange}
                placeholder="Enter 11-digit account ID"
                maxLength={11}
                error={accountIdError || undefined}
              />
              {accountIdFilter && (
                <p className="text-xs text-gray-500 mt-1">
                  {accountIdFilter.length}/11 digits
                </p>
              )}
            </div>

            <div>
              <Input
                label="Card Number (16 digits)"
                value={cardNumberFilter}
                onChange={handleCardNumberChange}
                placeholder="Enter 16-digit card number"
                maxLength={16}
                error={cardNumberError || undefined}
              />
              {cardNumberFilter && (
                <p className="text-xs text-gray-500 mt-1">
                  {cardNumberFilter.length}/16 digits
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
              disabled={loading}
            >
              Clear
            </Button>
          </div>
        </form>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading credit cards...</p>
            </div>
          </div>
        )}

        {!loading && hasSearched && cards.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-8 mb-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-yellow-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-yellow-800 text-lg font-semibold mb-2">
                No Credit Cards Found
              </p>
              <p className="text-yellow-700 text-sm">
                No credit cards match your search criteria. Please try different filters.
              </p>
            </div>
          </div>
        )}

        {!loading && hasSearched && cards.length > 0 && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {totalRecords} record{totalRecords !== 1 ? 's' : ''} (max {RECORDS_PER_PAGE} per page)
              </p>
              <p className="text-sm text-gray-600">
                Page {currentPage}
              </p>
            </div>

            <Table
              columns={[
                {
                  key: 'cardNumber',
                  label: 'Card Number',
                  render: (card: CreditCard) => (
                    <span className="font-mono">{maskCardNumber(card.cardNumber)}</span>
                  ),
                },
                {
                  key: 'accountId',
                  label: 'Account ID',
                  render: (card: CreditCard) => (
                    <span className="font-mono">{formatAccountId(card.accountId)}</span>
                  ),
                },
                {
                  key: 'activeStatus',
                  label: 'Status',
                  render: (card: CreditCard) => (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        card.activeStatus === 'Y'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ACTIVE_STATUS_LABELS[card.activeStatus]}
                    </span>
                  ),
                },
              ]}
              data={cards}
              onRowClick={(card) => handleViewCard(card.cardNumber)}
              actions={(card) => (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCard(card.cardNumber);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleEditCard(card.cardNumber, e)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            />

            <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
              <Button
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={!hasPrevious}
              >
                ← Previous (F7)
              </Button>

              <div className="text-sm text-gray-600">
                Page {currentPage}
              </div>

              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={!hasNext}
              >
                Next (F8) →
              </Button>
            </div>
          </>
        )}

        <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
          <p>Press F7 for previous page | Press F8 for next page</p>
          <p>Click on any row to view card details | Maximum {RECORDS_PER_PAGE} records per page</p>
        </div>
      </div>
    </div>
  );
}
