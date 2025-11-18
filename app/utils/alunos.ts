import config from '../../config';
import { getAuthToken } from './auth';

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  turma?: {
    id: number;
    nome: string;
  };
}

export async function getAlunos(): Promise<Aluno[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${config.API_URL}/alunos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Aluno[];
  } catch (error) {
    console.error('Error fetching alunos:', error);
    return [];
  }
}

export interface CreateAlunoData {
  nome: string;
  dataNasc: string;
  turmaId: number;
  mensalidade?: number;
}

export interface CreateAlunoResult {
  success: boolean;
  message: string;
  data?: Aluno;
}

export const validateAlunoData = (data: CreateAlunoData): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  if (!data.nome?.trim()) {
    errors.nome = 'Nome é obrigatório';
    isValid = false;
  } else if (data.nome.trim().length < 3) {
    errors.nome = 'Nome deve ter pelo menos 3 caracteres';
    isValid = false;
  } else if (data.nome.trim().length > 60) {
    errors.nome = 'Nome deve ter no máximo 60 caracteres';
    isValid = false;
  }

  if (!data.dataNasc) {
    errors.dataNasc = 'Data de nascimento é obrigatória';
    isValid = false;
  } else {
    const dataNasc = new Date(data.dataNasc);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataNasc > hoje) {
      errors.dataNasc = 'Data de nascimento não pode ser uma data futura';
      isValid = false;
    }
  }

  if (!data.turmaId || data.turmaId <= 0) {
    errors.turmaId = 'Turma é obrigatória';
    isValid = false;
  }

  if (data.mensalidade !== undefined && data.mensalidade <= 0) {
    errors.mensalidade = 'Mensalidade deve ser um valor positivo';
    isValid = false;
  }

  return { isValid, errors };
};

export async function createAluno(data: CreateAlunoData): Promise<CreateAlunoResult> {
  try {
    const validation = validateAlunoData(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Dados inválidos',
        data: undefined
      };
    }

    const token = getAuthToken();
    const response = await fetch(`${config.API_URL}/alunos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
        message: errorData?.message || `Erro ao cadastrar aluno: ${response.status}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Aluno cadastrado com sucesso',
      data: responseData
    };
  } catch (error) {
    console.error('Error creating aluno:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar aluno'
    };
  }
}

export async function getAlunosByTurma(turmaId: number): Promise<Aluno[]> {
  try {
    const token = getAuthToken();

    const response = await fetch(`${config.API_URL}/turmas/${turmaId}/alunos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.error('Unauthorized access');
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as Aluno[];
  } catch (error) {
    console.error('Error fetching alunos by turma:', error);
    return [];
  }
}

