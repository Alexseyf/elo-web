'use client';

import { useState } from 'react';
import type { DiarioFormData } from '@/types/diario';
import { DIARIO_STEPS } from '@/types/diario';

import CafeDaManha from './steps/CafeDaManha';
import Almoco from './steps/Almoco';
import LancheDaTarde from './steps/LancheDaTarde';
import Leite from './steps/Leite';
import Evacuacao from './steps/Evacuacao';
import Disposicao from './steps/Disposicao';
import Sono from './steps/Sono';
import ItemsRequest from './steps/ItemsRequest';
import Observacoes from './steps/Observacoes';
import DiarioSummary from './steps/DiarioSummary';

interface DiarioStepperProps {
  initialData?: Partial<DiarioFormData>;
  onSubmit: (data: DiarioFormData) => Promise<void>;
  isLoading?: boolean;
  editMode?: boolean;
  alunoNome?: string;
  onTrocarAluno?: () => void;
}

const STEP_COMPONENTS: Record<string, React.FC<any>> = {
  CafeDaManha,
  Almoco,
  LancheDaTarde,
  Leite,
  Evacuacao,
  Disposicao,
  Sono,
  ItemsRequest,
  Observacoes,
  DiarioSummary,
};

export default function DiarioStepper({
  initialData,
  onSubmit,
  isLoading = false,
  editMode = false,
  alunoNome = '',
  onTrocarAluno,
}: DiarioStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DiarioFormData>({
    cafeDaManha: initialData?.cafeDaManha || 'NAO_SE_APLICA',
    almoco: initialData?.almoco || 'NAO_SE_APLICA',
    lancheDaTarde: initialData?.lancheDaTarde || 'NAO_SE_APLICA',
    leite: initialData?.leite || 'NAO_SE_APLICA',
    evacuacao: initialData?.evacuacao || 'NORMAL',
    disposicao: initialData?.disposicao || 'NORMAL',
    sono: initialData?.sono || [],
    itensRequisitados: initialData?.itensRequisitados || [],
    observacoes: initialData?.observacoes || '',
  });

  const step = DIARIO_STEPS[currentStep];
  const StepComponent = STEP_COMPONENTS[step.component];

  const handleNext = () => {
    if (currentStep < DIARIO_STEPS.length - 1) {
      if (currentStep === 6) {
        const filteredSono = formData.sono.filter((p) => p.saved);
        setFormData({ ...formData, sono: filteredSono });
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const isLastStep = currentStep === DIARIO_STEPS.length - 1;
  const progressPercentage = ((currentStep + 1) / DIARIO_STEPS.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800">
                  {editMode ? 'Editar Diário' : 'Novo Diário'}
                </h1>
                {alunoNome && <p className="text-gray-600 mt-2 font-semibold">Aluno: {alunoNome}</p>}
                <p className="text-gray-500 mt-1 text-sm">{step.title}</p>
              </div>
              {onTrocarAluno && (
                <button
                  onClick={onTrocarAluno}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Trocar Aluno
                </button>
              )}
            </div>

            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
            <p className="text-center text-xs mt-2 text-gray-500">
              Etapa {currentStep + 1} de {DIARIO_STEPS.length}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {StepComponent && (
            <div className="bg-white rounded-lg shadow p-6">
              <StepComponent
                value={formData[step.fieldKey as keyof DiarioFormData]}
                onChange={(value: any) => {
                  setFormData({
                    ...formData,
                    [step.fieldKey]: value,
                  });
                }}
                data={formData}
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-6 sticky bottom-0">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            onClick={currentStep === 0 ? () => window.history.back() : handlePrevious}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-400 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg"
          >
            ← Anterior
          </button>

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  Salvando...
                </>
              ) : (
                <>
                  ✓ Salvar
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-lg"
            >
              Próximo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
