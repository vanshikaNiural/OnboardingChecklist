'use client';

import { useState, useEffect } from 'react';

export type OnboardingType = 'new' | 'transfer';

interface OnboardingTypeToggleProps {
  entityId: string;
  value: OnboardingType;
  onChange: (type: OnboardingType) => void;
}

export default function OnboardingTypeToggle({
  entityId,
  value,
  onChange
}: OnboardingTypeToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as OnboardingType;
    onChange(newType);
    // Persist to localStorage with entity key
    localStorage.setItem(`onboarding_type_${entityId}`, newType);
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-700">
        Onboarding type:
      </label>
      <select
        value={value}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="new">New Entity</option>
        <option value="transfer">Transfer from another provider</option>
      </select>
    </div>
  );
}

export function getStoredOnboardingType(entityId: string): OnboardingType {
  if (typeof window === 'undefined') return 'new';
  const stored = localStorage.getItem(`onboarding_type_${entityId}`);
  return (stored as OnboardingType) || 'new';
}
