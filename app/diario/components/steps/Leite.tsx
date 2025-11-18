'use client';

import { MealSelector } from './MealSelector';

interface LeiteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Leite({ value, onChange }: LeiteProps) {
  return <MealSelector value={value} onChange={onChange} title="Leite" />;
}
