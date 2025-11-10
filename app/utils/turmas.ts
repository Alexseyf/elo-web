import config from '../../config';
import { getAuthToken, handleAuthError } from './auth';

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

export enum TURMA {
  BERCARIO2 = 'BERCARIO2',
  MATERNAL1 = 'MATERNAL1',
  MATERNAL2 = 'MATERNAL2',
  PRE1 = 'PRE1',
  PRE2 = 'PRE2',
  TURNOINVERSO = 'TURNOINVERSO'
}

export interface DadosTurma {
  nome: TURMA;
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
    'BERCARIO2': 'Berçário 2',
    'MATERNAL1': 'Maternal 1',
    'MATERNAL2': 'Maternal 2',
    'PRE1': 'Pré 1',
    'PRE2': 'Pré 2',
    'TURNOINVERSO': 'Turno Inverso'
  };

  return mapeamentoTurmas[turmaUpperCase] || nomeTurma;
}

export function converterNomeParaEnum(nomeFormatado: string): TURMA | null {
  const mapeamentoInverso: Record<string, TURMA> = {
    'Berçário 2': TURMA.BERCARIO2,
    'Maternal 1': TURMA.MATERNAL1,
    'Maternal 2': TURMA.MATERNAL2,
    'Pré 1': TURMA.PRE1,
    'Pré 2': TURMA.PRE2,
    'Turno Inverso': TURMA.TURNOINVERSO
  };

  return mapeamentoInverso[nomeFormatado] || 
         (Object.values(TURMA).includes(nomeFormatado.toUpperCase() as TURMA) ? 
          nomeFormatado.toUpperCase() as TURMA : null);
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

export interface CreateTurmaResult {
  success: boolean;
  message: string;
  data?: Turma;
}

export async function cadastrarTurma(dadosTurma: DadosTurma): Promise<CreateTurmaResult> {
  try {
    const token = getAuthToken();

    if (!dadosTurma.nome) {
      return {
        success: false,
        message: 'Nome da turma é obrigatório'
      };
    }

    if (!Object.values(TURMA).includes(dadosTurma.nome)) {
      return {
        success: false,
        message: 'Nome da turma deve ser um valor válido: ' + Object.values(TURMA).join(', ')
      };
    }

    const response = await fetch(`${config.API_URL}/turmas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: dadosTurma.nome })
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
        message: errorData?.erro?.message || errorData?.message || `Erro ao cadastrar turma: ${response.status}`
      };
    }

    const novaTurma = await response.json();
    return {
      success: true,
      message: 'Turma cadastrada com sucesso',
      data: novaTurma
    };
  } catch (error) {
    console.error('Erro ao cadastrar turma:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar turma'
    };
  }
}

export async function cadastrarTurmaComNomeFormatado(nomeFormatado: string): Promise<{
  success: boolean;
  data?: Turma;
  error?: string;
}> {
  const enumTurma = converterNomeParaEnum(nomeFormatado);
  
  if (!enumTurma) {
    return {
      success: false,
      error: `Nome de turma inválido: ${nomeFormatado}. Valores válidos: ${Object.values(TURMA).map(formatarNomeTurma).join(', ')}`
    };
  }

  return cadastrarTurma({ nome: enumTurma });
}

