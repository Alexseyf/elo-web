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
import { TurmaComTotalAlunos } from '../../utils/turmas';

interface AlunosChartProps {
  data: TurmaComTotalAlunos[];
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
        <p className="text-sm font-medium">{`${payload[0].payload.nome}`}</p>
        <p className="text-sm text-blue-600">{`${payload[0].value} alunos`}</p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
        <p className="text-sm font-medium">{`${payload[0].payload.nome}`}</p>
        <p className="text-sm text-blue-600">{`${payload[0].value} alunos`}</p>
      </div>
    );
  }
  return null;
};

export default function AlunosChart({ data }: AlunosChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">Nenhum dado disponível para exibir.</p>
      </div>
    );
  }

  const totalAlunos = data.reduce((sum, turma) => sum + turma.totalAlunosAtivos, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-600">Total de Turmas</p>
          <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{data.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">{totalAlunos}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-600">Média por Turma</p>
          <p className="text-2xl md:text-3xl font-bold text-amber-600 mt-2">
            {(totalAlunos / data.length).toFixed(1)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-600">Maior Turma</p>
          <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-2">
            {Math.max(...data.map((t) => t.totalAlunosAtivos))}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 md:p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Alunos por Turma</h3>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="nome"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="totalAlunosAtivos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 md:p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Distribuição de Alunos por Turma</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalAlunosAtivos"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.map((turma, index) => (
            <div key={turma.id} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700">{turma.nome}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow overflow-hidden overflow-x-auto">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Detalhes por Turma</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Turma
              </th>
              <th
                scope="col"
                className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total de Alunos
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Percentual
              </th>
              <th
                scope="col"
                className="hidden md:table-cell px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((turma, index) => {
              const percentual = ((turma.totalAlunosAtivos / totalAlunos) * 100).toFixed(1);
              let status = '';
              let statusColor = '';
              
              if (turma.totalAlunosAtivos <= 7) {
                status = 'Muito Baixo';
                statusColor = 'text-red-600 bg-red-50';
              } else if (turma.totalAlunosAtivos <= 11) {
                status = 'Baixo';
                statusColor = 'text-orange-600 bg-orange-50';
              } else if (turma.totalAlunosAtivos <= 15) {
                status = 'Normal';
                statusColor = 'text-green-600 bg-green-50';
              } else {
                status = 'Excelente';
                statusColor = 'text-blue-600 bg-blue-50';
              }

              return (
                <tr key={turma.id} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {turma.nome}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                    {turma.totalAlunosAtivos}
                  </td>
                  <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {percentual}%
                  </td>
                  <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
