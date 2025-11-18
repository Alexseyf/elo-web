'use client';

import { MealSelector } from './MealSelector';

interface LancheTardeProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LancheDaTarde({ value, onChange }: LancheTardeProps) {
  return <MealSelector value={value} onChange={onChange} title="Lanche da tarde" />;
}
