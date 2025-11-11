'use client';

import { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string | number; label: string }>;
  className?: string;
  error?: boolean;
  errorColor?: string;
}

export function CustomSelect({
  id,
  name,
  value,
  onChange,
  options,
  className = '',
  error = false,
  errorColor = 'border-red-300 focus:ring-red-500'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelectOption = (optionValue: string | number) => {
    const event = {
      target: {
        name,
        value: optionValue.toString(),
        type: 'select-one'
      }
    } as unknown as React.ChangeEvent<HTMLSelectElement>;

    onChange(event);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => String(opt.value) === String(value))?.label || 'Selecione uma opção';

  const baseClass = error ? errorColor : 'border-gray-300 focus:ring-blue-500';

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm text-left bg-white focus:outline-none focus:ring-1 flex justify-between items-center ${baseClass} ${className}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              type="button"
              onClick={() => handleSelectOption(option.value)}
              className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                String(value) === String(option.value) ? 'bg-blue-100 font-semibold' : ''
              }`}
            >
              <span className="block whitespace-normal break-words">{option.label}</span>
            </button>
          ))}
        </div>
      )}

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="hidden"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
