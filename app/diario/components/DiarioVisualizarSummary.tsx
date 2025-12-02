import React from 'react';
import { Diario } from '@/app/utils/diarios';

interface DiarioVisualizarSummaryProps {
  diario: Diario;
}

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

const formatItemsList = (items: string[]) => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} e ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
};

export default function DiarioVisualizarSummary({ diario }: DiarioVisualizarSummaryProps) {
  const totalSleepHours = diario.periodosSono?.reduce((total: number, period) => {
    const [hours] = period.tempoTotal.split('h');
    return total + parseInt(hours);
  }, 0) || 0;

  const totalSleepMinutes = diario.periodosSono?.reduce((total: number, p) => {
    const minutes = p.tempoTotal.split('h')[1]?.split('m')[0] || '0';
    return total + parseInt(minutes);
  }, 0) || 0;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Refeições */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Refeições</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Lanche da manhã:</span>
            <span className="font-medium">{formatValue(diario.lancheManha)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Almoço:</span>
            <span className="font-medium">{formatValue(diario.almoco)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Lanche da tarde:</span>
            <span className="font-medium">{formatValue(diario.lancheTarde)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Leite:</span>
            <span className="font-medium">{formatValue(diario.leite)}</span>
          </div>
        </div>
      </div>

      {/* Saúde */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3">Saúde</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Evacuação:</span>
            <span className="font-medium">{formatValue(diario.evacuacao)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Disposição:</span>
            <span className="font-medium">{formatValue(diario.disposicao)}</span>
          </div>
        </div>
      </div>

      {/* Sono */}
      {diario.periodosSono && diario.periodosSono.length > 0 && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Sono</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Total de períodos:</span>
              <span className="font-medium">{diario.periodosSono.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Tempo total:</span>
              <span className="font-medium">
                {totalSleepHours}h{totalSleepMinutes}m
              </span>
            </div>
            {diario.periodosSono.map((period, idx) => (
              <div key={period.id} className="text-gray-600 ml-4">
                • Período {idx + 1}: {period.horaDormiu} → {period.horaAcordou} ({period.tempoTotal})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itens */}
      {diario.itensProvidencia && diario.itensProvidencia.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Itens Solicitados</h3>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              {formatItemsList(diario.itensProvidencia.map(i => formatValue(i.itemProvidencia?.nome)))}
            </p>
          </div>
        </div>
      )}

      {/* Observações */}
      {diario.observacoes && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Observações</h3>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{diario.observacoes}</p>
        </div>
      )}
    </div>
  );
}
