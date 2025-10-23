import config from '../../config';
import { getAuthToken } from './auth';

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface Professor {
  id: number;
  usuarioId: number;
  usuario: Usuario;
}

interface Aluno {
  id: number;
  nome: string;
}

export interface TurmaComTotalAlunos {
  id: number;
  nome: string;
  totalAlunosAtivos: number;
}

export interface Turma {
  id: number;
  nome: string;
  ano: number;
  professores: Professor[];
  alunos: Aluno[];
}

// Função simplificada para buscar turmas para uso em formulários
export async function getTurmas(): Promise<{id: number; nome: string}[]> {
  try {
    const result = await fetchTurmas();
    
    if (!result.success || !result.data) {
      console.error('Erro ao buscar turmas:', result.error);
      return [];
    }
    
    return result.data.map(turma => ({
      id: turma.id,
      nome: turma.nome
    }));
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    return [];
  }
}

export async function fetchTurmas(): Promise<{ 
  success: boolean; 
  data?: Turma[];
  error?: string; 
}> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }
    
    const response = await fetch(`${config.API_URL}/turmas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Erro ao buscar turmas: ${response.status}`
      };
    }
    
    const turmas = await response.json();
    
    return {
      success: true,
      data: formatarTurmas(turmas)
    };
  } catch (error) {
    console.error('Erro ao buscar turmas:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar turmas'
    };
  }
}

export async function fetchTurmaById(id: number): Promise<{
  success: boolean;
  data?: Turma;
  error?: string;
}> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }
    
    const response = await fetch(`${config.API_URL}/turmas/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Erro ao buscar turma: ${response.status}`
      };
    }
    
    const turma = await response.json();
    
    if (turma) {
      turma.nome = formatarNomeTurma(turma.nome);
    }
    
    return {
      success: true,
      data: turma
    };
  } catch (error) {
    console.error('Erro ao buscar turma:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar turma'
    };
  }
}

export function formatarNomeTurma(nomeTurma: string): string {
  if (!nomeTurma) return '';
  
  const turmaUpperCase = nomeTurma.toUpperCase();

  const mapeamentoTurmas: Record<string, string> = {
    'BERCARIO1': 'Berçário 1',
    'BERCARIO2': 'Berçário 2',
    'MATERNAL1': 'Maternal 1',
    'MATERNAL2': 'Maternal 2',
    'PRE1': 'Pré 1',
    'PRE2': 'Pré 2',
    'TURNOINVERSO': 'Turno Inverso'
  };

  return mapeamentoTurmas[turmaUpperCase] || nomeTurma;
}

export function formatarTurmas(turmas: Turma[]): Turma[] {
  if (!turmas || !Array.isArray(turmas)) return [];
  
  return turmas.map(turma => ({
    ...turma,
    nome: formatarNomeTurma(turma.nome)
  }));
}

export async function fetchTotalAlunosPorTurma(): Promise<{
  success: boolean;
  data?: TurmaComTotalAlunos[];
  error?: string;
}> {
  try {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }
    
    const response = await fetch(`${config.API_URL}/turmas/totalAlunosTurma`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Erro ao buscar total de alunos por turma: ${response.status}`
      };
    }
    
    const turmasComTotal = await response.json();
    
    return {
      success: true,
      data: turmasComTotal.map((turma: TurmaComTotalAlunos) => ({
        ...turma,
        nome: formatarNomeTurma(turma.nome)
      }))
    };
  } catch (error) {
    console.error('Erro ao buscar total de alunos por turma:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar total de alunos por turma'
    };
  }
}
