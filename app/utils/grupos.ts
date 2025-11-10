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
    // console.log('Dados da api (grupos):', grupos);
    return grupos;
  } catch (error: any) {
    console.error('Erro ao buscar grupos:', error);
    return [];
  }
}

export function formatarNomeGrupo(nome: string): string {
  return nome
    .split('_')
    .map(palavra => {
      const palavraMinuscula = palavra.toLowerCase();
      return palavraMinuscula.charAt(0).toUpperCase() + palavraMinuscula.slice(1);
    })
    .join(' ')
    .replace('Bebes', 'Bebês')
    .replace('Criancas', 'Crianças');
}

export interface GrupoFormatado extends Grupo {
  nomeFormatado: string;
}

export function getGruposFormatados(): Promise<GrupoFormatado[]> {
  return getGrupos().then(grupos => 
    grupos.map(grupo => ({
      ...grupo,
      nomeFormatado: formatarNomeGrupo(grupo.nome)
    }))
  );
}
