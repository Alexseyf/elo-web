'use client';

import type { DiarioFormData } from '@/app/lib/types/diario';

interface DiarioSummaryProps {
  data: DiarioFormData;
}

export default function DiarioSummary({ data }: DiarioSummaryProps) {
  const formatValue = (value: string) => {
    const map: Record<string, string> = {
      'OTIMO': 'Ótimo',
      'BOM': 'Bom',
      'REGULAR': 'Regular',
      'NAO_ACEITOU': 'Não aceitou',
      'NAO_SE_APLICA': 'Não se aplica',
      'NORMAL': 'Normal',
      'LIQUIDA': 'Líquida',
      'DURA': 'Dura',
      'NAO_EVACUOU': 'Não evacuou',
      'AGITADO': 'Agitado',
      'CALMO': 'Calmo',
      'SONOLENTO': 'Sonolento',
      'CANSADO': 'Cansado',
      'FRALDA': 'Fralda',
      'LENCO_UMEDECIDO': 'Lenços Umedecidos',
      'POMADA': 'Pomada',
      'LEITE': 'Leite',
      'ESCOVA_DE_DENTE': 'Escova de Dente',
      'CREME_DENTAL': 'Creme Dental',
    };
    return map[value] || value;
  };

  const totalSleepHours = data.sono.reduce((total: number, period) => {
    const [hours] = period.tempoTotal.split('h');
    return total + parseInt(hours);
  }, 0);

  const formatItemsList = (items: string[]): string => {
    const formattedItems = items.map(item => formatValue(item));
    if (formattedItems.length === 0) return '';
    if (formattedItems.length === 1) return formattedItems[0];
    if (formattedItems.length === 2) return `${formattedItems[0]} e ${formattedItems[1]}`;
    return `${formattedItems.slice(0, -1).join(', ')} e ${formattedItems[formattedItems.length - 1]}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="hidden md:block text-2xl font-bold text-gray-800">Resumo do Diário</h2>
      <p className="text-gray-600">Revise os dados antes de salvar.</p>

      {/* Refeições */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Refeições</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Lanche da manhã:</span>
            <span className="font-medium">{formatValue(data.cafeDaManha)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Almoço:</span>
            <span className="font-medium">{formatValue(data.almoco)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Lanche da tarde:</span>
            <span className="font-medium">{formatValue(data.lancheDaTarde)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Leite:</span>
            <span className="font-medium">{formatValue(data.leite)}</span>
          </div>
        </div>
      </div>

      {/* Saúde */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Saúde</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Evacuação:</span>
            <span className="font-medium">{formatValue(data.evacuacao)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Disposição:</span>
            <span className="font-medium">{formatValue(data.disposicao)}</span>
          </div>
        </div>
      </div>

      {/* Sono */}
      {data.sono.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Sono</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total de períodos:</span>
              <span className="font-medium">{data.sono.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Tempo total:</span>
              <span className="font-medium">
                {totalSleepHours}h{data.sono.reduce((total: number, p) => total + (parseInt(p.tempoTotal.split('h')[1]?.split('m')[0] || '0')), 0)}m
              </span>
            </div>
            {data.sono.map((period, idx) => (
              <div key={period.id} className="text-gray-600 ml-4">
                • Período {idx + 1}: {period.horaDormiu} → {period.horaAcordou} ({period.tempoTotal})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itens */}
      {data.itensRequisitados.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Itens Solicitados</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              {formatItemsList(data.itensRequisitados)}
            </p>
          </div>
        </div>
      )}

      {/* Observações */}
      {data.observacoes && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Observações</h3>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{data.observacoes}</p>
        </div>
      )}

      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-800">
          Clique em <strong>Salvar</strong> para confirmar e armazenar este diário.
        </p>
      </div>
    </div>
  );
}
