import config from '../../config';
import { getAuthToken } from './auth';

export enum CAMPO_EXPERIENCIA {
  EU_OUTRO_NOS = "EU_OUTRO_NOS",
  CORPO_GESTOS_MOVIMENTOS = "CORPO_GESTOS_MOVIMENTOS",
  TRACOS_SONS_CORES_FORMAS = "TRACOS_SONS_CORES_FORMAS",
  ESCUTA_FALA_PENSAMENTO_IMAGINACAO = "ESCUTA_FALA_PENSAMENTO_IMAGINACAO",
  ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES = "ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES"
}

const campoExperienciaTextos: Record<CAMPO_EXPERIENCIA, string> = {
  [CAMPO_EXPERIENCIA.EU_OUTRO_NOS]: "O eu, o outro e o nós",
  [CAMPO_EXPERIENCIA.CORPO_GESTOS_MOVIMENTOS]: "Corpo, gestos e movimentos",
  [CAMPO_EXPERIENCIA.TRACOS_SONS_CORES_FORMAS]: "Traços, sons, cores e formas",
  [CAMPO_EXPERIENCIA.ESCUTA_FALA_PENSAMENTO_IMAGINACAO]: "Escuta, fala, pensamento e imaginação",
  [CAMPO_EXPERIENCIA.ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES]: "Espaços, tempos, quantidades, relações e transformações"
};

export function formatarCampoExperiencia(campo: CAMPO_EXPERIENCIA): string {
  return campoExperienciaTextos[campo];
}

export function textoParaCampoExperiencia(texto: string): CAMPO_EXPERIENCIA | undefined {
  const entrada = texto.trim();
  const entries = Object.entries(campoExperienciaTextos);
  const found = entries.find(([_, value]) => value === entrada);
  return found ? found[0] as CAMPO_EXPERIENCIA : undefined;
}

export interface CreateCampoExperienciaResult {
  success: boolean;
  message: string;    data?: {
    id: number;
    campoExperiencia: CAMPO_EXPERIENCIA;
  };
}

export async function createCampoExperiencia(campo: CAMPO_EXPERIENCIA): Promise<CreateCampoExperienciaResult> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ campoExperiencia: campo }),
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
        message: errorData?.message || `Erro ao cadastrar campo de experiência: ${response.status}`
      };
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Campo de experiência cadastrado com sucesso',
      data: responseData
    };
  } catch (error) {
    console.error('Error creating campo de experiência:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar campo de experiência'
    };
  }
}

export interface CampoExperienciaResponse {
  id: number;
  campoExperiencia: CAMPO_EXPERIENCIA;
}

export interface GetCamposExperienciaResult {
  success: boolean;
  message: string;
  data?: CampoExperienciaResponse[];
}

let camposCache: CampoExperienciaResponse[] | null = null;

export async function getCamposExperiencia(): Promise<GetCamposExperienciaResult> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campos`, {
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
          message: 'Não autorizado'
        };
      }
      
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        message: errorData?.message || `Erro ao buscar campos de experiência: ${response.status}`
      };
    }

    const responseData = await response.json();
    camposCache = responseData;
    return {
      success: true,
      message: 'Campos de experiência obtidos com sucesso',
      data: responseData
    };
  } catch (error) {
    console.error('Error fetching campos de experiência:', error);
    return {
      success: false,
      message: 'Erro ao buscar campos de experiência'
    };
  }
}

export async function mapearCampoExperienciaParaId(nomeCampo: CAMPO_EXPERIENCIA): Promise<number> {
  try {
    if (!camposCache) {
      const resultado = await getCamposExperiencia();
      if (!resultado.success || !resultado.data) {
        console.error('Erro ao buscar campos para mapeamento:', resultado.message);
        return 0;
      }
      camposCache = resultado.data;
    }

    const campoEncontrado = camposCache.find(c => c.campoExperiencia === nomeCampo);
    
    if (!campoEncontrado) {
      console.error('Campo não encontrado no cache:', nomeCampo);
      return 0;
    }

    return campoEncontrado.id;
  } catch (error) {
    console.error('Erro ao mapear campo de experiência para ID:', error);
    return 0;
  }
}

export function limparCachesCampos(): void {
  camposCache = null;
}
