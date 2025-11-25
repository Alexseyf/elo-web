import config from '../../config';
import { getAuthToken } from './auth';

export interface Diario {
  id: number;
  alunoId: number;
  data: string;
  observacoes: string;
  disposicao: string;
  lancheManha: string;
  almoco: string;
  lancheTarde: string;
  leite: string;
  evacuacao: string;
  aluno: {
    id: number;
    nome: string;
    dataNascimento: string;
  };
  periodosSono: Array<{
    id: number;
    horaDormiu: string;
    horaAcordou: string;
    tempoTotal: string;
  }>;
  itensProvidencia: Array<{
    id: number;
    itemProvidenciaId: number;
    itemProvidencia: {
      id: number;
      nome: string;
    };
  }>;
}

export async function getDiariosByAlunoId(alunoId: number): Promise<Diario[]> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${config.API_URL}/diarios/aluno/${alunoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return [];
      }
      if (response.status === 404) {
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as Diario[];
  } catch (error) {
    console.error('Error fetching diarios by alunoId:', error);
    return [];
  }
}
