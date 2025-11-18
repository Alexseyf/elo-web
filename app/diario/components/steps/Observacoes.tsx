'use client';

interface ObservacoesProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Observacoes({ value, onChange }: ObservacoesProps) {
  return (
    <div className="space-y-4">
      <h2 className="hidden md:block text-xl font-semibold text-gray-800">Recados</h2>
      <p className="text-xs md:text-base text-gray-600">Deixe observações ou recados importantes.</p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: Criança com pequena febre, tomou remédio pela manhã..."
        rows={10}
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none font-medium text-gray-700"
      />

      <div className="text-sm text-gray-500 flex justify-between">
        <span>Dica: Seja claro e conciso nas observações</span>
        <span>{value.length} caracteres</span>
      </div>
    </div>
  );
}
