import config from '../../config';
import { getAuthToken, getAuthUser } from './auth';

export interface Aluno {
  id: number;
  nome: string;
  dataNascimento?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  responsavel?: string;
  ativo?: boolean;
}

export interface TurmaProfessor {
  id: number;
  nome: string;
  grupo?: string;
  alunos: Aluno[];
  totalAlunos: number;
}

export interface GetTurmasProfessorResult {
  success: boolean;
  message: string;
  data?: TurmaProfessor[];
}

export async function getTurmasProfessor(professorId: number): Promise<GetTurmasProfessorResult> {
  try {
    const token = getAuthToken();

    const turmasResponse = await fetch(`${config.API_URL}/turmas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!turmasResponse.ok) {
      return {
        success: false,
        message: `Erro ao buscar turmas: ${turmasResponse.status}`
      };
    }

    const todasTurmas = await turmasResponse.json();
    
    const turmasDoProfessor = todasTurmas.filter((turma: any) => 
      turma.professores && 
      turma.professores.some((prof: any) => prof.id === professorId || prof.usuarioId === professorId)
    );

    const alunosResponse = await fetch(`${config.API_URL}/alunos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!alunosResponse.ok) {
      return {
        success: false,
        message: `Erro ao buscar alunos: ${alunosResponse.status}`
      };
    }

    const todosAlunos = await alunosResponse.json();

    const turmasComAlunos: TurmaProfessor[] = turmasDoProfessor.map((turma: any) => {
      const alunosDaTurma = todosAlunos.filter((aluno: any) => 
        aluno.turma && aluno.turma.id === turma.id
      );



      return {
        id: turma.id,
        nome: turma.nome,
        grupo: turma.grupo || undefined,
        alunos: alunosDaTurma.map((aluno: any) => ({
          id: aluno.id,
          nome: aluno.nome,
          dataNascimento: aluno.dataNasc,
          cpf: aluno.cpf,
          email: aluno.email,
          telefone: aluno.telefone,
          endereco: aluno.endereco,
          responsavel: aluno.responsavel,
          ativo: aluno.ativo !== false
        })),
        totalAlunos: alunosDaTurma.length
      };
    });

    return {
      success: true,
      message: 'Turmas do professor obtidas com sucesso',
      data: turmasComAlunos
    };
  } catch (error) {
    console.error('Error fetching turmas via /alunos endpoint:', error);
    return {
      success: false,
      message: 'Erro ao buscar turmas do professor'
    };
  }
}



