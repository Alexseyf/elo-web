'use client';

import { MEAL_OPTIONS } from '@/app/lib/types/diario';

interface MealStepProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
}

export function MealSelector({ value, onChange, title }: MealStepProps) {
  const getLabel = (option: string) => {
    const labels: Record<string, string> = {
      'OTIMO': 'Ótimo',
      'BOM': 'Bom',
      'REGULAR': 'Regular',
      'NAO_ACEITOU': 'Não aceitou',
      'NAO_SE_APLICA': 'Não se aplica',
    };
    return labels[option] || option;
  };

  return (
    <div className="space-y-4">
      <h2 className="hidden md:block text-xl font-semibold text-gray-800">{title}</h2>
      <p className="text-xs md:text-base text-gray-600 mb-6">Como foi o {title.toLowerCase()}?</p>

      <div className="space-y-3">
        {MEAL_OPTIONS.map((option) => (
          <label
            key={option}
            className="flex items-center p-2 md:p-4 border-2 rounded-lg cursor-pointer transition-all"
            style={{
              borderColor: value === option ? '#3b82f6' : '#e5e7eb',
              backgroundColor: value === option ? '#eff6ff' : '#ffffff',
            }}
          >
            <input
              type="radio"
              name="meal"
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5"
            />
            <span className="ml-3 font-medium text-sm md:text-base text-gray-700">
              {getLabel(option)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
