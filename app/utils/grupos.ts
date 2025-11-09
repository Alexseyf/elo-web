import config from '../../config';
import { getAuthToken } from './auth';

export interface Grupo {
  id: number;
  nome: string;
  totalTurmas: number;
  totalObjetivos: number;
}

export async function getGrupos(): Promise<Grupo[]> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Usuário não autenticado');

    const response = await fetch(`${config.API_URL}/grupos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || errorData.details || `Erro ao listar grupos: ${response.status}`);
    }

    const grupos = await response.json();
    return grupos;
  } catch (error: any) {
    console.error('Erro ao buscar grupos:', error);
    return [];
  }
}
