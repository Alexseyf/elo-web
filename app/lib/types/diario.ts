export interface SleepPeriod {
  id: string;
  sleepHour: number;
  sleepMinute: number;
  wakeHour: number;
  wakeMinute: number;
  horaDormiu: string;
  horaAcordou: string;
  tempoTotal: string;
  saved: boolean;
}

export interface DiarioFormData {
  cafeDaManha: string;
  almoco: string;
  lancheDaTarde: string;
  leite: string;
  evacuacao: string;
  disposicao: string;
  sono: SleepPeriod[];
  itensRequisitados: string[];
  observacoes: string;
}

export interface DiarioEntry extends DiarioFormData {
  id: string;
  alunoId: number;
  alunoNome: string;
  turmaId: number;
  nomeTurma: string;
  data: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const DIARIO_STEPS = [
  { id: 'cafe', title: 'Lanche da manhã', fieldKey: 'cafeDaManha', component: 'CafeDaManha' },
  { id: 'almoco', title: 'Almoço', fieldKey: 'almoco', component: 'Almoco' },
  { id: 'lanche', title: 'Lanche da tarde', fieldKey: 'lancheDaTarde', component: 'LancheDaTarde' },
  { id: 'leite', title: 'Leite', fieldKey: 'leite', component: 'Leite' },
  { id: 'evacuacao', title: 'Evacuação', fieldKey: 'evacuacao', component: 'Evacuacao' },
  { id: 'disposicao', title: 'Disposição', fieldKey: 'disposicao', component: 'Disposicao' },
  { id: 'sono', title: 'Sono', fieldKey: 'sono', component: 'Sono' },
  { id: 'itens', title: 'Itens a Solicitar', fieldKey: 'itensRequisitados', component: 'ItemsRequest' },
  { id: 'observacoes', title: 'Recados', fieldKey: 'observacoes', component: 'Observacoes' },
  { id: 'resumo', title: 'Resumo', fieldKey: '', component: 'DiarioSummary' },
] as const;

export const MEAL_OPTIONS = ['OTIMO', 'BOM', 'REGULAR', 'NAO_ACEITOU', 'NAO_SE_APLICA'];
export const EVACUATION_OPTIONS = ['NORMAL', 'LIQUIDA', 'DURA', 'NAO_EVACUOU'];
export const DISPOSITION_OPTIONS = ['NORMAL', 'AGITADO', 'CALMO', 'SONOLENTO', 'CANSADO'];

export type DiarioStepType = (typeof DIARIO_STEPS)[number];
