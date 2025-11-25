import config from '../../config';
import { getAuthToken } from './auth';

export enum TIPO_EVENTO {
  REUNIAO = 'REUNIAO',
  FERIADO = 'FERIADO',
  RECESSO = 'RECESSO',
  EVENTO_ESCOLAR = 'EVENTO_ESCOLAR',
  ATIVIDADE_PEDAGOGICA = 'ATIVIDADE_PEDAGOGICA',
  OUTRO = 'OUTRO'
}

export interface Cronograma {
  id: number;
  titulo: string;
  descricao: string;
  data: string;
  tipoEvento: TIPO_EVENTO;
  isAtivo: boolean;
  criadorId: number;
  createdAt?: string;
  updatedAt?: string;
  criador?: {
    id: number;
    nome: string;
    email: string;
  };
}

export interface CreateCronogramaData {
  titulo: string;
  descricao: string;
  data: string;
  tipoEvento: TIPO_EVENTO;
  isAtivo?: boolean;
  criadorId: number;
}

export interface CreateCronogramaResult {
  success: boolean;
  message: string;
  data?: Cronograma;
}

export const validateCronogramaData = (data: CreateCronogramaData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  if (!data.titulo?.trim()) {
    errors.titulo = 'Título é obrigatório';
    isValid = false;
  } else if (data.titulo.trim().length > 100) {
    errors.titulo = 'Título deve ter no máximo 100 caracteres';
    isValid = false;
  }

  if (!data.descricao?.trim()) {
    errors.descricao = 'Descrição é obrigatória';
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
      const dataEvento = new Date(data.data);
      if (isNaN(dataEvento.getTime())) {
        errors.data = 'Data está em formato inválido';
        isValid = false;
      }
    } catch {
      errors.data = 'Data está em formato inválido';
      isValid = false;
    }
  }

  if (!data.tipoEvento || !Object.values(TIPO_EVENTO).includes(data.tipoEvento)) {
    errors.tipoEvento = 'Tipo de evento é obrigatório';
    isValid = false;
  }

  if (!data.criadorId || data.criadorId <= 0) {
    errors.criadorId = 'Criador é obrigatório';
    isValid = false;
  }

  if (data.isAtivo !== undefined && typeof data.isAtivo !== 'boolean') {
    errors.isAtivo = 'isAtivo deve ser um valor booleano';
    isValid = false;
  }

  return { isValid, errors };
};

export async function createCronograma(data: CreateCronogramaData): Promise<CreateCronogramaResult> {
  try {
    const validation = validateCronogramaData(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Dados inválidos',
        data: undefined
      };
    }

    const token = getAuthToken();
    
    // Formata para ISO 8601 completo
    let dataFormatada = data.data;
    if (data.data && data.data.length === 10) {
      dataFormatada = `${data.data}T00:00:00.000Z`;
    }

    const response = await fetch(`${config.API_URL}/cronogramas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        data: dataFormatada,
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
        message: errorData?.message || `Erro ao cadastrar cronograma: ${response.status}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Cronograma cadastrado com sucesso',
      data: responseData.cronograma || responseData
    };
  } catch (error) {
    console.error('Error creating cronograma:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar cronograma'
    };
  }
}

export async function fetchCronogramas(): Promise<{ success: boolean; data?: Cronograma[]; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${config.API_URL}/cronogramas`, {
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
        error: errorData?.message || `Erro ao buscar cronogramas: ${response.status}`
      };
    }

    const responseData = await response.json();
    const cronogramas = responseData.cronogramas || responseData;
    
    return {
      success: true,
      data: cronogramas
    };
  } catch (error) {
    console.error('Error fetching cronogramas:', error);
    return {
      success: false,
      error: 'Erro ao buscar cronogramas'
    };
  }
}

export async function fetchCronogramaDetalhes(id: number): Promise<{ success: boolean; data?: Cronograma; error?: string }> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${config.API_URL}/cronogramas/${id}`, {
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
          error: 'Cronograma não encontrado'
        };
      }

      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Erro ao buscar cronograma: ${response.status}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      data: responseData.cronograma || responseData
    };
  } catch (error) {
    console.error('Error fetching cronograma detalhes:', error);
    return {
      success: false,
      error: 'Erro ao buscar detalhes do cronograma'
    };
  }
}

export function getValidTiposEvento(): TIPO_EVENTO[] {
  return Object.values(TIPO_EVENTO);
}
