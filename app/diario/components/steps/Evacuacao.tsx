'use client';

import { EVACUATION_OPTIONS } from '@/app/lib/types/diario';

interface EvacuacaoProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Evacuacao({ value, onChange }: EvacuacaoProps) {
  const getLabel = (option: string) => {
    const labels: Record<string, string> = {
      'NORMAL': 'Normal',
      'LIQUIDA': 'Líquida',
      'DURA': 'Dura',
      'NAO_EVACUOU': 'Não evacuou',
    };
    return labels[option] || option;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Evacuação</h2>
      <p className="text-gray-600 mb-6">Como foi a evacuação?</p>

      <div className="space-y-3">
        {EVACUATION_OPTIONS.map((option) => (
          <label
            key={option}
            className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
            style={{
              borderColor: value === option ? '#3b82f6' : '#e5e7eb',
              backgroundColor: value === option ? '#eff6ff' : '#ffffff',
            }}
          >
            <input
              type="radio"
              name="evacuacao"
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              className="w-5 h-5"
            />
            <span className="ml-3 font-medium text-gray-700">
              {getLabel(option)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
