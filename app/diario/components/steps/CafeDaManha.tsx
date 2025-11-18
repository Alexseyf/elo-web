'use client';

import { MealSelector } from './MealSelector';

interface CafeProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CafeDaManha({ value, onChange }: CafeProps) {
  return <MealSelector value={value} onChange={onChange} title="Lanche da manhã" />;
}
