'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { 
  formatarCampoExperiencia,
  CAMPO_EXPERIENCIA
} from '../../utils/campos';
import { formatarNomeTurma } from '../../utils/turmas';
import { TurmaAtividade, TurmaInfo } from '../../utils/atividades';

interface AtividadesChartProps {
  turmas: TurmaInfo[];
  atividades: TurmaAtividade[];
}

interface TurmaComCampos {
  turmaId: number;
  turma: string;
  campos: Array<{
    campo: string;
    total: number;
    percentual: number;
  }>;
  totalAtividades: number;
}

interface CampoTotalGeral {
  campo: string;
  total: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomPieTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-medium">{`${payload[0].payload.campo}`}</p>
        <p className="text-sm text-blue-600">{`${payload[0].value} atividades`}</p>
        <p className="text-sm text-green-600">{`${payload[0].payload.percentual}%`}</p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-medium">{`${payload[0].payload.campo}`}</p>
        <p className="text-sm text-blue-600">{`${payload[0].value} atividades`}</p>
      </div>
    );
  }
  return null;
};

export default function AtividadesChart({ turmas, atividades }: AtividadesChartProps) {
  if (!atividades || atividades.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">Nenhuma atividade registrada ainda.</p>
      </div>
    );
  }

  const turmasMap = new Map<number, TurmaComCampos>();
  
  atividades.forEach(atividade => {
    const campoFormatado = formatarCampoExperiencia(atividade.campoExperiencia);
    const turmaFormatada = formatarNomeTurma(atividade.turma.nome);
    
    if (!turmasMap.has(atividade.turma.id)) {
      turmasMap.set(atividade.turma.id, {
        turmaId: atividade.turma.id,
        turma: turmaFormatada,
        campos: [],
        totalAtividades: 0
      });
    }
    
    const turmaData = turmasMap.get(atividade.turma.id)!;
    turmaData.totalAtividades += 1;
    
    const campoExistente = turmaData.campos.find(c => c.campo === campoFormatado);
    if (campoExistente) {
      campoExistente.total += 1;
    } else {
      turmaData.campos.push({
        campo: campoFormatado,
        total: 1,
        percentual: 0
      });
    }
  });

  turmasMap.forEach(turma => {
    turma.campos.forEach(campo => {
      campo.percentual = (campo.total / turma.totalAtividades) * 100;
    });
  });

  const turmasComCampos = Array.from(turmasMap.values());

  const camposTotais = new Map<string, number>();
  atividades.forEach(atividade => {
    const campoFormatado = formatarCampoExperiencia(atividade.campoExperiencia);
    camposTotais.set(campoFormatado, (camposTotais.get(campoFormatado) || 0) + 1);
  });

  const dadosGeraisCampos: CampoTotalGeral[] = Array.from(camposTotais.entries()).map(([campo, total]) => ({
    campo,
    total
  }));

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Gráfico de barras - Total por campo de experiência */}
      <div className="rounded-lg bg-white p-2 sm:p-4 md:p-6 shadow w-full max-w-full">
        <h3 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold">Total de Atividades por Campo de Experiência</h3>
        <div className="w-full max-w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={dadosGeraisCampos} 
              margin={{ top: 10, right: 50, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="campo"
                textAnchor="end"
                tick={false}
                interval={0}
              />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar 
                dataKey="total" 
                fill="#3b82f6" 
                radius={[8, 8, 0, 0]}
              >
                {dadosGeraisCampos.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legenda colorida dos campos */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {dadosGeraisCampos.map((campo, index) => (
            <div key={campo.campo} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{campo.campo}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos por turma */}
      {turmasComCampos.map((turma, turmaIndex) => (
        <div key={turma.turmaId} className="rounded-lg bg-white p-2 sm:p-4 md:p-6 shadow">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">{turma.turma}</h3>
          </div>
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Gráfico de Pizza */}
            <div className="w-full max-w-full">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={turma.campos}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {turma.campos.map((campo, index) => (
                      <Cell key={`cell-${turmaIndex}-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legenda e estatísticas */}
            <div className="space-y-2 sm:space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Total de Atividades</p>
                  <p className="text-xl font-bold text-blue-600">{turma.totalAtividades}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {turma.campos.map((campo, index) => (
                  <div key={campo.campo} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700">{campo.campo}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{campo.total}</p>
                      <p className="text-xs text-gray-500">{campo.percentual.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
