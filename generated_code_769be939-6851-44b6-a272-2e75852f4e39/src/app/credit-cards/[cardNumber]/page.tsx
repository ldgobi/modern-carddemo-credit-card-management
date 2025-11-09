'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { creditCardService } from '@/services/creditCardService';
import {
  CreditCard,
  maskCardNumber,
  formatActiveStatus,
  formatExpirationDate,
} from '@/types/creditCard';
import { Button } from '@/components/ui';

export default function CreditCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [card, setCard] = useState<CreditCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.cardNumber) {
      fetchCard(params.cardNumber as string);
    }
  }, [params.cardNumber]);

  const fetchCard = async (cardNumber: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await creditCardService.getCreditCardByNumber(cardNumber);
      setCard(data);
    } catch (err: any) {
      console.error('Failed to load credit card:', err);
      setError(err.message || 'Failed to load credit card');
      setCard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (card) {
      router.push(`/credit-cards/${card.cardNumber}/edit`);
    }
  };

  const handleBackToList = () => {
    router.push('/credit-cards');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
            <p className="text-gray-600">Loading credit card details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleBackToList}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg font-semibold mb-2">Credit Card Not Found</p>
          <p className="text-gray-500 mb-6">
            The credit card you are looking for does not exist or has been removed.
          </p>
          <Button variant="secondary" onClick={handleBackToList}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Credit Card Details</h1>
        <div className="flex gap-2">
          <Button onClick={handleEdit}>Edit Card</Button>
          <Button variant="secondary" onClick={handleBackToList}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">CVV Code</label>
            <p className="text-gray-900 font-mono text-lg">***</p>
            <p className="text-xs text-gray-500 mt-1">CVV is masked for security</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expiration Date
            </label>
            <p className="text-gray-900 text-lg">
              {formatExpirationDate(
                parseInt(card.expirationDate.split('-')[1]),
                parseInt(card.expirationDate.split('-')[0])
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div className="flex items-center gap-2">
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
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={handleEdit}>Edit Card</Button>
        <Button variant="secondary" onClick={handleBackToList}>
          Back to List
        </Button>
      </div>
    </div>
  );
}
