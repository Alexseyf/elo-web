import config from '../../config';
import { getAuthToken } from './auth';
import { mapearTurmaParaGrupo, mapearGrupoParaId } from './turmas';
import { mapearCampoExperienciaParaId } from './campos';

export async function getObjetivos(): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Usuário não autenticado');

    const response = await fetch(`${config.API_URL}/objetivos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || errorData.details || `Erro ao listar objetivos: ${response.status}`);
    }

    const objetivos = await response.json();
    // console.log('Dados da api (objetivos):', objetivos);
    return objetivos;
  } catch (error: any) {
    console.error('Erro ao buscar objetivos:', error);
    return [];
  }
}

function mapearCampoParaId(nomeCampo: string): number {
  const mapeamentoCampoId: Record<string, number> = {
    'EU_OUTRO_NOS': 1,
    'CORPO_GESTOS_MOVIMENTOS': 2,
    'TRACOS_SONS_CORES_FORMAS': 3,
    'ESCUTA_FALA_PENSAMENTO_IMAGINACAO': 4,
    'ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES': 5
  };
  return mapeamentoCampoId[nomeCampo] || 0;
}

export async function getObjetivosPorGrupoIdCampoId(grupoId: number, campoId: number): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) throw new Error('Usuário não autenticado');

    if (!grupoId || !campoId || grupoId <= 0 || campoId <= 0) {
      console.error('grupoId e campoId devem ser números positivos', { grupoId, campoId });
      return [];
    }

    const url = `${config.API_URL}/objetivos/grupo-campo?grupoId=${grupoId}&campoId=${campoId}`;
    // console.log('Fazendo requisição para:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erro na resposta da API:', errorData);
      throw new Error(errorData.erro || errorData.details || `Erro ao listar objetivos: ${response.status}`);
    }

    const objetivos = await response.json();
    // console.log('Objetivos da API:', objetivos);
    return objetivos;
  } catch (error: any) {
    console.error('Erro ao buscar objetivos por grupoId e campoId:', error);
    return [];
  }
}

export async function getObjetivosPorTurmaECampo(nomeTurma: string, campoExperiencia: string): Promise<any[]> {
  try {
    // console.log('getObjetivosPorTurmaECampo chamado com:', { nomeTurma, campoExperiencia });
    
    const grupo = mapearTurmaParaGrupo(nomeTurma);
    // console.log('Grupo mapeado:', grupo);
    if (!grupo) {
      console.error('Turma não mapeada para grupo:', nomeTurma);
      return [];
    }

    const grupoId = await mapearGrupoParaId(grupo);
    // console.log('grupoId mapeado (dinâmico):', grupoId);
    if (!grupoId) {
      console.error('Grupo não mapeado para ID:', grupo);
      return [];
    }

    const campoId = await mapearCampoExperienciaParaId(campoExperiencia as any);
    // console.log('campoId mapeado (dinâmico):', campoId);
    if (!campoId) {
      console.error('Campo não mapeado para ID:', campoExperiencia);
      return [];
    }

    // console.log('Chamando API com:', { grupoId, campoId });
    return await getObjetivosPorGrupoIdCampoId(grupoId, campoId);
  } catch (error: any) {
    console.error('Erro ao buscar objetivos por turma e campo:', error);
    return [];
  }
}
