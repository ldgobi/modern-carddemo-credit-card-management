'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { creditCardService } from '@/services/creditCardService';
import {
  CreditCard,
  UpdateCreditCardRequest,
  validateEmbossedName,
  validateExpirationMonth,
  validateExpirationYear,
  sanitizeEmbossedName,
  parseExpirationDate,
  EMBOSSED_NAME_MAX_LENGTH,
  MIN_EXPIRATION_MONTH,
  MAX_EXPIRATION_MONTH,
  MIN_EXPIRATION_YEAR,
  MAX_EXPIRATION_YEAR,
  ACTIVE_STATUS_OPTIONS,
  maskCardNumber,
} from '@/types/creditCard';
import { Input, Select, Button, Modal } from '@/components/ui';

interface FormData {
  embossedName: string;
  activeStatus: 'Y' | 'N';
  expirationMonth: number;
  expirationYear: number;
}

interface FormErrors {
  embossedName?: string;
  activeStatus?: string;
  expirationMonth?: string;
  expirationYear?: string;
}

export default function EditCreditCardPage() {
  const params = useParams();
  const router = useRouter();
  const [originalCard, setOriginalCard] = useState<CreditCard | null>(null);
  const [formData, setFormData] = useState<FormData>({
    embossedName: '',
    activeStatus: 'Y',
    expirationMonth: 1,
    expirationYear: new Date().getFullYear(),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNoChangesModal, setShowNoChangesModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
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
      const data = await creditCardService.getCreditCardByCardNumber(cardNumber);
      setOriginalCard(data);

      const { month, year } = parseExpirationDate(data.expirationDate);
      setFormData({
        embossedName: data.embossedName,
        activeStatus: data.activeStatus,
        expirationMonth: month,
        expirationYear: year,
      });
    } catch (err: any) {
      console.error('Failed to load credit card:', err);
      alert('Failed to load credit card details');
      router.push('/credit-cards');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.embossedName.trim()) {
      newErrors.embossedName = 'Embossed name is required';
    } else if (!validateEmbossedName(formData.embossedName)) {
      if (formData.embossedName.length > EMBOSSED_NAME_MAX_LENGTH) {
        newErrors.embossedName = `Embossed name must not exceed ${EMBOSSED_NAME_MAX_LENGTH} characters`;
      } else {
        newErrors.embossedName = 'Embossed name must contain only alphabets and spaces';
      }
    }

    if (!validateExpirationMonth(formData.expirationMonth)) {
      newErrors.expirationMonth = `Month must be between ${MIN_EXPIRATION_MONTH} and ${MAX_EXPIRATION_MONTH}`;
    }

    if (!validateExpirationYear(formData.expirationYear)) {
      newErrors.expirationYear = `Year must be between ${MIN_EXPIRATION_YEAR} and ${MAX_EXPIRATION_YEAR}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = (): boolean => {
    if (!originalCard) return false;

    const { month, year } = parseExpirationDate(originalCard.expirationDate);

    return (
      formData.embossedName !== originalCard.embossedName ||
      formData.activeStatus !== originalCard.activeStatus ||
      formData.expirationMonth !== month ||
      formData.expirationYear !== year
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      setShowNoChangesModal(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);

    try {
      setSaving(true);

      const updateData = {
        cardNumber: params.cardNumber as string,
        accountId: originalCard!.accountId,
        embossedName: formData.embossedName,
        activeStatus: formData.activeStatus,
        expirationMonth: formData.expirationMonth,
        expirationYear: formData.expirationYear,
      };

      await creditCardService.updateCreditCard(params.cardNumber as string, updateData);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Failed to update credit card:', err);

      if (err.message && err.message.includes('409')) {
        setShowConflictModal(true);
      } else {
        alert('Failed to update credit card. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push(`/credit-cards/${params.cardNumber}`);
  };

  const handleConflictClose = () => {
    setShowConflictModal(false);
    fetchCard(params.cardNumber as string);
  };

  const handleEmbossedNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeEmbossedName(e.target.value);
    setFormData({ ...formData, embossedName: sanitized });
    if (errors.embossedName) {
      setErrors({ ...errors, embossedName: undefined });
    }
  };

  const handleExpirationMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setFormData({ ...formData, expirationMonth: value });
      if (errors.expirationMonth) {
        setErrors({ ...errors, expirationMonth: undefined });
      }
    }
  };

  const handleExpirationYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setFormData({ ...formData, expirationYear: value });
      if (errors.expirationYear) {
        setErrors({ ...errors, expirationYear: undefined });
      }
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

  if (!originalCard) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">Credit card not found</p>
            <Button variant="secondary" onClick={() => router.push('/credit-cards')}>
              Back to List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const originalExpiration = parseExpirationDate(originalCard.expirationDate);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-800">COCRDC03</h1>
              <span className="text-sm text-gray-600">CC03</span>
            </div>
            <span className="text-sm text-gray-600">{currentDateTime}</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Edit Credit Card</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-blue-600 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-1">Read-Only Fields</p>
              <p className="text-sm text-blue-700">
                Card Number and Account ID cannot be changed
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Read-Only Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Card Number
              </label>
              <p className="text-gray-900 font-mono bg-gray-200 border border-gray-300 rounded px-3 py-2">
                {maskCardNumber(originalCard.cardNumber)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account ID
              </label>
              <p className="text-gray-900 font-mono bg-gray-200 border border-gray-300 rounded px-3 py-2">
                {originalCard.accountId}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Editable Fields</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Embossed Name
                  </label>
                  <p className="text-gray-600 bg-gray-50 border border-gray-300 rounded px-3 py-2">
                    {originalCard.embossedName}
                  </p>
                </div>

                <div>
                  <Input
                    label="New Embossed Name"
                    value={formData.embossedName}
                    onChange={handleEmbossedNameChange}
                    error={errors.embossedName}
                    required
                    maxLength={EMBOSSED_NAME_MAX_LENGTH}
                    placeholder="Enter alphabets and spaces only"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.embossedName.length}/{EMBOSSED_NAME_MAX_LENGTH} characters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Active Status
                  </label>
                  <p className="text-gray-600 bg-gray-50 border border-gray-300 rounded px-3 py-2">
                    {originalCard.activeStatus === 'Y' ? 'Active' : 'Inactive'}
                  </p>
                </div>

                <div>
                  <Select
                    label="New Active Status"
                    value={formData.activeStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, activeStatus: e.target.value as 'Y' | 'N' })
                    }
                    options={ACTIVE_STATUS_OPTIONS}
                    error={errors.activeStatus}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Expiration
                  </label>
                  <p className="text-gray-600 bg-gray-50 border border-gray-300 rounded px-3 py-2">
                    {originalExpiration.month}/{originalExpiration.year}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      label="New Month"
                      type="number"
                      value={formData.expirationMonth}
                      onChange={handleExpirationMonthChange}
                      error={errors.expirationMonth}
                      required
                      min={MIN_EXPIRATION_MONTH}
                      max={MAX_EXPIRATION_MONTH}
                    />
                  </div>
                  <div>
                    <Input
                      label="New Year"
                      type="number"
                      value={formData.expirationYear}
                      onChange={handleExpirationYearChange}
                      error={errors.expirationYear}
                      required
                      min={MIN_EXPIRATION_YEAR}
                      max={MAX_EXPIRATION_YEAR}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-red-600 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Please correct the following errors:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {Object.values(errors).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/credit-cards/${params.cardNumber}`)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Changes"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to save the following changes to this credit card?
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {formData.embossedName !== originalCard.embossedName && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Embossed Name:</p>
                <p className="text-sm text-gray-600">
                  <span className="line-through">{originalCard.embossedName}</span> →{' '}
                  <span className="font-semibold text-green-700">{formData.embossedName}</span>
                </p>
              </div>
            )}

            {formData.activeStatus !== originalCard.activeStatus && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Active Status:</p>
                <p className="text-sm text-gray-600">
                  <span className="line-through">
                    {originalCard.activeStatus === 'Y' ? 'Active' : 'Inactive'}
                  </span>{' '}
                  →{' '}
                  <span className="font-semibold text-green-700">
                    {formData.activeStatus === 'Y' ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            )}

            {(formData.expirationMonth !== originalExpiration.month ||
              formData.expirationYear !== originalExpiration.year) && (
              <div>
                <p className="text-sm font-semibold text-gray-700">Expiration Date:</p>
                <p className="text-sm text-gray-600">
                  <span className="line-through">
                    {originalExpiration.month}/{originalExpiration.year}
                  </span>{' '}
                  →{' '}
                  <span className="font-semibold text-green-700">
                    {formData.expirationMonth}/{formData.expirationYear}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button onClick={handleConfirmSave}>Confirm</Button>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="Success"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-green-700">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-semibold">Credit card updated successfully!</p>
          </div>

          <p className="text-gray-700">
            The credit card has been updated with your changes.
          </p>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSuccessClose}>OK</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showNoChangesModal}
        onClose={() => setShowNoChangesModal(false)}
        title="No Changes Detected"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-700">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-semibold">No changes to save</p>
          </div>

          <p className="text-gray-700">
            You haven't made any changes to the credit card information.
          </p>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowNoChangesModal(false)}>OK</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showConflictModal}
        onClose={handleConflictClose}
        title="Concurrent Modification Detected"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-700">
            <svg
              className="h-8 w-8"
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
            <p className="text-lg font-semibold">Conflict Error (409)</p>
          </div>

          <p className="text-gray-700">
            This credit card has been modified by another user. The page will reload with the
            latest data.
          </p>

          <div className="flex justify-end pt-4">
            <Button onClick={handleConflictClose}>Reload Data</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
