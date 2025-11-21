import config from '../../config';
import { getAuthToken } from './auth';
import { CAMPO_EXPERIENCIA } from './campos';

export enum SEMESTRE {
  PRIMEIRO_SEMESTRE = 'PRIMEIRO_SEMESTRE',
  SEGUNDO_SEMESTRE = 'SEGUNDO_SEMESTRE'
}

export interface Atividade {
  id: number;
  ano: number;
  periodo: SEMESTRE;
  quantHora: number;
  descricao: string;
  data: string;
  turmaId: number;
  campoExperiencia: CAMPO_EXPERIENCIA;
  objetivoId: number;
  professorId: number;
  isAtivo: boolean;
  createdAt?: string;
  updatedAt?: string;
  professor?: {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
  };
  turma?: {
    id: number;
    nome: string;
  };
  objetivo?: {
    id: number;
    codigo: string;
    descricao: string;
  };
}

export interface CreateAtividadeData {
  ano: number;
  periodo: SEMESTRE;
  quantHora: number;
  descricao: string;
  data: string;
  turmaId: number;
  campoExperiencia: CAMPO_EXPERIENCIA;
  objetivoId: number;
  isAtivo?: boolean;
}

export interface CreateAtividadeResult {
  success: boolean;
  message: string;
  data?: Atividade;
}

export const validateAtividadeData = (data: CreateAtividadeData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  if (!data.ano || data.ano <= 0) {
    errors.ano = 'Ano é obrigatório';
    isValid = false;
  } else if (data.ano < 1900 || data.ano > 2100) {
    errors.ano = 'Ano deve estar entre 1900 e 2100';
    isValid = false;
  }

  if (!data.periodo || !Object.values(SEMESTRE).includes(data.periodo)) {
    errors.periodo = 'Período é obrigatório';
    isValid = false;
  }

  if (!data.quantHora || data.quantHora <= 0) {
    errors.quantHora = 'Quantidade de horas é obrigatória';
    isValid = false;
  }

  if (!data.descricao?.trim()) {
    errors.descricao = 'Descrição é obrigatória';
    isValid = false;
  } else if (data.descricao.trim().length < 5) {
    errors.descricao = 'Descrição deve ter pelo menos 5 caracteres';
    isValid = false;
  } else if (data.descricao.trim().length > 500) {
    errors.descricao = 'Descrição deve ter no máximo 500 caracteres';
    isValid = false;
  }

  if (!data.data) {
    errors.data = 'Data é obrigatória';
    isValid = false;
  } else {
    try {
      const dataAtividade = new Date(data.data);
      if (isNaN(dataAtividade.getTime())) {
        errors.data = 'Data está em formato inválido';
        isValid = false;
      }
    } catch {
      errors.data = 'Data está em formato inválido';
      isValid = false;
    }
  }

  if (!data.turmaId || data.turmaId <= 0) {
    errors.turmaId = 'Turma é obrigatória';
    isValid = false;
  }

  if (!data.campoExperiencia || !Object.values(CAMPO_EXPERIENCIA).includes(data.campoExperiencia)) {
    errors.campoExperiencia = 'Campo de experiência é obrigatório';
    isValid = false;
  }

  if (!data.objetivoId || data.objetivoId <= 0) {
    errors.objetivoId = 'Objetivo é obrigatório';
    isValid = false;
  }

  if (data.isAtivo !== undefined && typeof data.isAtivo !== 'boolean') {
    errors.isAtivo = 'isAtivo deve ser um valor booleano';
    isValid = false;
  }

  return { isValid, errors };
};

export async function createAtividade(data: CreateAtividadeData): Promise<CreateAtividadeResult> {
  try {
    const validation = validateAtividadeData(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Dados inválidos',
        data: undefined
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${config.API_URL}/atividades`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        isAtivo: data.isAtivo ?? true
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          message: 'Não autorizado'
        };
      }

      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message: errorData?.message || `Erro ao cadastrar atividade: ${response.status}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Atividade cadastrada com sucesso',
      data: responseData.atividade || responseData
    };
  } catch (error) {
    console.error('Error creating atividade:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar atividade'
    };
  }
}

export async function fetchAtividades(): Promise<{ success: boolean; data?: Atividade[]; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${config.API_URL}/atividades`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'Não autorizado'
        };
      }

      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Erro ao buscar atividades: ${response.status}`
      };
    }

    const responseData = await response.json();
    const atividades = responseData.atividades || responseData;
    const atividadesMapeadas = atividades.map((atividade: any) => ({
      ...atividade,
      turmaId: atividade.turmaId || atividade.turma_id || atividade.turma?.id || 0
    }));
    
    return {
      success: true,
      data: atividadesMapeadas
    };
  } catch (error) {
    console.error('Error fetching atividades:', error);
    return {
      success: false,
      error: 'Erro ao buscar atividades'
    };
  }
}

export async function fetchAtividadeDetalhes(id: number): Promise<{ success: boolean; data?: Atividade; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${config.API_URL}/atividades/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'Não autorizado'
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: 'Atividade não encontrada'
        };
      }

      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Erro ao buscar atividade: ${response.status}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData.atividade || responseData
    };
  } catch (error) {
    console.error('Error fetching atividade detalhes:', error);
    return {
      success: false,
      error: 'Erro ao buscar detalhes da atividade'
    };
  }
}

export function getValidPeriodos(): SEMESTRE[] {
  return Object.values(SEMESTRE);
}

export function getValidCamposExperiencia(): CAMPO_EXPERIENCIA[] {
  return Object.values(CAMPO_EXPERIENCIA);
}

export { CAMPO_EXPERIENCIA };
