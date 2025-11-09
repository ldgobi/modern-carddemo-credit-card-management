'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { creditCardService } from '@/services/creditCardService';
import {
  CreditCard,
  UpdateCreditCardRequest,
  maskCardNumber,
  validateEmbossedName,
  validateExpirationMonth,
  validateExpirationYear,
  validateActiveStatus,
} from '@/types/creditCard';
import { Input, Select, Button } from '@/components/ui';

export default function EditCreditCardPage() {
  const params = useParams();
  const router = useRouter();
  const [originalCard, setOriginalCard] = useState<CreditCard | null>(null);
  const [formData, setFormData] = useState<UpdateCreditCardRequest>({
    cardNumber: '',
    accountId: '',
    embossedName: '',
    activeStatus: 'Y',
    expirationMonth: 1,
    expirationYear: new Date().getFullYear(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      setOriginalCard(data);

      // Parse expiration date
      const [year, month] = data.expirationDate.split('-');
      
      setFormData({
        cardNumber: data.cardNumber,
        accountId: data.accountId,
        embossedName: data.embossedName,
        activeStatus: data.activeStatus,
        expirationMonth: parseInt(month),
        expirationYear: parseInt(year),
      });
    } catch (err: any) {
      console.error('Failed to load credit card:', err);
      setError(err.message || 'Failed to load credit card');
      setOriginalCard(null);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.embossedName || formData.embossedName.trim() === '') {
      errors.embossedName = 'Embossed name is required';
    } else if (!validateEmbossedName(formData.embossedName)) {
      errors.embossedName = 'Embossed name must contain only alphabets and spaces (max 50 chars)';
    }

    if (!validateActiveStatus(formData.activeStatus)) {
      errors.activeStatus = 'Active status must be Y or N';
    }

    if (!validateExpirationMonth(formData.expirationMonth)) {
      errors.expirationMonth = 'Expiration month must be between 1 and 12';
    }

    if (!validateExpirationYear(formData.expirationYear)) {
      errors.expirationYear = 'Expiration year must be between 1950 and 2099';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    if (!originalCard) return;

    try {
      setSaving(true);
      setError(null);
      setShowConfirmation(false);

      await creditCardService.updateCreditCard(originalCard.cardNumber, formData);
      router.push(`/credit-cards/${originalCard.cardNumber}`);
    } catch (err: any) {
      console.error('Failed to update credit card:', err);
      setError(err.message || 'Failed to update credit card');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    if (originalCard) {
      router.push(`/credit-cards/${originalCard.cardNumber}`);
    } else {
      router.push('/credit-cards');
    }
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

  if (error && !originalCard) {
    return (
      <div className="p-6">
        <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-6">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push('/credit-cards')}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  if (!originalCard) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg font-semibold mb-2">Credit Card Not Found</p>
          <p className="text-gray-500 mb-6">
            The credit card you are trying to edit does not exist or has been removed.
          </p>
          <Button variant="secondary" onClick={() => router.push('/credit-cards')}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1).padStart(2, '0'),
  }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 150 }, (_, i) => {
    const year = 1950 + i;
    return {
      value: String(year),
      label: String(year),
    };
  });

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit Credit Card</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Read-Only Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Card Number</label>
            <p className="text-gray-900 font-mono text-lg">{maskCardNumber(originalCard.cardNumber)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Account ID</label>
            <p className="text-gray-900 text-lg">{originalCard.accountId}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Editable Fields</h2>

        <div>
          <Input
            label="Embossed Name"
            value={formData.embossedName}
            onChange={(e) => {
              setFormData({ ...formData, embossedName: e.target.value });
              if (validationErrors.embossedName) {
                setValidationErrors({ ...validationErrors, embossedName: '' });
              }
            }}
            required
            maxLength={50}
          />
          {validationErrors.embossedName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.embossedName}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Alphabets and spaces only, maximum 50 characters
          </p>
        </div>

        <div>
          <Select
            label="Active Status"
            value={formData.activeStatus}
            onChange={(e) => {
              setFormData({ ...formData, activeStatus: e.target.value as 'Y' | 'N' });
              if (validationErrors.activeStatus) {
                setValidationErrors({ ...validationErrors, activeStatus: '' });
              }
            }}
            options={[
              { value: 'Y', label: 'Active (Y)' },
              { value: 'N', label: 'Inactive (N)' },
            ]}
            required
          />
          {validationErrors.activeStatus && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.activeStatus}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Expiration Month"
              value={String(formData.expirationMonth)}
              onChange={(e) => {
                setFormData({ ...formData, expirationMonth: parseInt(e.target.value) });
                if (validationErrors.expirationMonth) {
                  setValidationErrors({ ...validationErrors, expirationMonth: '' });
                }
              }}
              options={monthOptions}
              required
            />
            {validationErrors.expirationMonth && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.expirationMonth}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Month (1-12)</p>
          </div>

          <div>
            <Select
              label="Expiration Year"
              value={String(formData.expirationYear)}
              onChange={(e) => {
                setFormData({ ...formData, expirationYear: parseInt(e.target.value) });
                if (validationErrors.expirationYear) {
                  setValidationErrors({ ...validationErrors, expirationYear: '' });
                }
              }}
              options={yearOptions}
              required
            />
            {validationErrors.expirationYear && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.expirationYear}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Year (1950-2099)</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </form>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Changes</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save these changes to the credit card?
            </p>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Embossed Name:</span>
                <span className="font-semibold text-gray-900">{formData.embossedName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Status:</span>
                <span className="font-semibold text-gray-900">
                  {formData.activeStatus === 'Y' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiration:</span>
                <span className="font-semibold text-gray-900">
                  {String(formData.expirationMonth).padStart(2, '0')}/{formData.expirationYear}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmSave} disabled={saving}>
                {saving ? 'Saving...' : 'Confirm'}
              </Button>
              <Button variant="secondary" onClick={handleCancelConfirmation} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
