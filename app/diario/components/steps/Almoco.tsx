'use client';

import { MealSelector } from './MealSelector';

interface AlmocoProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Almoco({ value, onChange }: AlmocoProps) {
  return <MealSelector value={value} onChange={onChange} title="Almoço" />;
}
