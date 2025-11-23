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
  RelatorioAtividadesCampoExperiencia 
} from '../../utils/campos';
import { formatarNomeTurma } from '../../utils/turmas';

interface AtividadesChartProps {
  data: RelatorioAtividadesCampoExperiencia;
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

export default function AtividadesChart({ data }: AtividadesChartProps) {
  if (!data || !data.relatorio || data.relatorio.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">Nenhum dado disponível para exibir.</p>
      </div>
    );
  }

  const turmasMap = new Map<number, TurmaComCampos>();
  
  data.relatorio.forEach(campoRelatorio => {
    const campoFormatado = formatarCampoExperiencia(campoRelatorio.campoExperiencia);
    
    campoRelatorio.detalhesPorTurma.forEach(detalhe => {
      const turmaFormatada = formatarNomeTurma(detalhe.turma);
      
      if (!turmasMap.has(detalhe.turmaId)) {
        turmasMap.set(detalhe.turmaId, {
          turmaId: detalhe.turmaId,
          turma: turmaFormatada,
          campos: [],
          totalAtividades: 0
        });
      }
      
      const turmaData = turmasMap.get(detalhe.turmaId)!;
      turmaData.totalAtividades += detalhe.total;
      turmaData.campos.push({
        campo: campoFormatado,
        total: detalhe.total,
        percentual: 0
      });
    });
  });

  turmasMap.forEach(turma => {
    turma.campos.forEach(campo => {
      campo.percentual = (campo.total / turma.totalAtividades) * 100;
    });
  });

  const turmasComCampos = Array.from(turmasMap.values());

  const totalAtividades = data.resumo.totalAtividades;
  const totalCampos = data.resumo.totalCampos;
  const totalTurmasUnicas = turmasComCampos.length;

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-4 w-full">
        <div className="rounded-lg bg-white p-2 sm:p-4 shadow w-full max-w-full">
          <p className="text-sm font-medium text-gray-600">Total de Atividades</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{totalAtividades}</p>
        </div>
        <div className="rounded-lg bg-white p-2 sm:p-4 shadow w-full max-w-full">
          <p className="text-sm font-medium text-gray-600">Campos Trabalhados</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">{totalCampos}</p>
        </div>
        <div className="rounded-lg bg-white p-2 sm:p-4 shadow w-full max-w-full">
          <p className="text-sm font-medium text-gray-600">Turmas Ativas</p>
          <p className="text-2xl md:text-3xl font-bold text-amber-600 mt-2">{totalTurmasUnicas}</p>
        </div>
        <div className="rounded-lg bg-white p-2 sm:p-4 shadow w-full max-w-full">
          <p className="text-sm font-medium text-gray-600">Turmas Envolvidas</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-2">{totalTurmasUnicas}</p>
        </div>
      </div>

      {/* Gráfico de barras - Total por campo de experiência */}
      <div className="rounded-lg bg-white p-2 sm:p-4 md:p-6 shadow w-full max-w-full">
        <h3 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold">Total de Atividades por Campo de Experiência</h3>
        <div className="w-full max-w-full">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data.relatorio.map(campo => ({
                campo: formatarCampoExperiencia(campo.campoExperiencia),
                total: campo.totalGeral
              }))} 
              margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="campo"
                angle={-45}
                textAnchor="end"
                height={100}
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
                {data.relatorio.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legenda colorida dos campos */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {data.relatorio.map((campo, index) => (
            <div key={campo.campoExperiencia} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{formatarCampoExperiencia(campo.campoExperiencia)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos por turma */}
      {turmasComCampos.map((turma, turmaIndex) => (
        <div key={turma.turmaId} className="rounded-lg bg-white p-2 sm:p-4 md:p-6 shadow">
          <h3 className="mb-2 sm:mb-4 text-base sm:text-lg font-semibold">{turma.turma} - Distribuição por Campos</h3>
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