'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { creditCardService } from '@/services/creditCardService';
import { CreditCard, maskCardNumber, formatExpirationDate, ACTIVE_STATUS_LABELS } from '@/types/creditCard';
import { Button } from '@/components/ui';

export default function CreditCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<CreditCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (params.cardNumber) {
      fetchCard(params.cardNumber as string);
    }
  }, [params.cardNumber]);

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

  const fetchCard = async (cardNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await creditCardService.getCreditCardByCardNumber(cardNumber);
      setCard(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load credit card';
      setError(errorMessage);
      console.error('Failed to load credit card:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading credit card details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">COCRDC02</h1>
                <span className="text-sm text-gray-600">CC02</span>
              </div>
              <span className="text-sm text-gray-600">{currentDateTime}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-700">Credit Card Details</h2>
          </div>

          <div className="bg-red-50 border border-red-300 rounded-lg p-8 mb-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-red-800 text-lg font-semibold mb-2">
                Credit Card Not Found
              </p>
              <p className="text-red-700 text-sm mb-4">
                {error || 'The requested credit card could not be found.'}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="secondary" onClick={() => router.push('/credit-cards')}>
              Back to List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">COCRDC02</h1>
              <span className="text-sm text-gray-600">CC02</span>
            </div>
            <span className="text-sm text-gray-600">{currentDateTime}</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Credit Card Details</h2>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 mb-6 text-white shadow-xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-200 text-sm mb-1">Card Number</p>
              <p className="text-2xl font-mono tracking-wider">{maskCardNumber(card.cardNumber)}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  card.activeStatus === 'Y'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {ACTIVE_STATUS_LABELS[card.activeStatus]}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-blue-200 text-sm mb-1">Cardholder Name</p>
              <p className="text-lg font-semibold uppercase">{card.embossedName}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Expiration Date</p>
              <p className="text-lg font-mono">{formatExpirationDate(card.expirationDate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Card Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account ID
              </label>
              <p className="text-gray-900 font-mono bg-white border border-gray-300 rounded px-3 py-2">
                {card.accountId}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                CVV Code
              </label>
              <p className="text-gray-900 font-mono bg-white border border-gray-300 rounded px-3 py-2">
                {card.cvvCode}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Embossed Name
              </label>
              <p className="text-gray-900 bg-white border border-gray-300 rounded px-3 py-2">
                {card.embossedName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Active Status
              </label>
              <div className="bg-white border border-gray-300 rounded px-3 py-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    card.activeStatus === 'Y'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {ACTIVE_STATUS_LABELS[card.activeStatus]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expiration Date
              </label>
              <p className="text-gray-900 font-mono bg-white border border-gray-300 rounded px-3 py-2">
                {formatExpirationDate(card.expirationDate)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Expiration
              </label>
              <p className="text-gray-900 bg-white border border-gray-300 rounded px-3 py-2">
                {new Date(card.expirationDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {(card.createdAt || card.updatedAt) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {card.createdAt && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Created At
                  </label>
                  <p className="text-gray-900 bg-white border border-gray-300 rounded px-3 py-2">
                    {new Date(card.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </p>
                </div>
              )}

              {card.updatedAt && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Updated At
                  </label>
                  <p className="text-gray-900 bg-white border border-gray-300 rounded px-3 py-2">
                    {new Date(card.updatedAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
          <Button onClick={() => router.push(`/credit-cards/${card.cardNumber}/edit`)}>
            Edit Card
          </Button>
          <Button variant="secondary" onClick={() => router.push('/credit-cards')}>
            Back to List
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
          <p>Card details are displayed in a secure format</p>
          <p>Card number is masked for security purposes</p>
        </div>
      </div>
    </div>
  );
}
