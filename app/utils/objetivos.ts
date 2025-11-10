import config from '../../config';
import { getAuthToken } from './auth';

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
