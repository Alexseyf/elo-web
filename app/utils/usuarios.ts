import config from '../../config';
import { getAuthToken } from './auth';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  roles: string[];
  primeiroAcesso: boolean;
  isAtivo: boolean;
}

export interface UsuariosPorRole {
  ADMIN: Usuario[];
  PROFESSOR: Usuario[];
  RESPONSAVEL: Usuario[];
  todos: Usuario[];
}

export async function fetchUsuariosAtivos(): Promise<{
  success: boolean;
  data?: UsuariosPorRole;
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
    
    const response = await fetch(`${config.API_URL}/usuarios/ativos`, {
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
        error: errorData.message || `Erro ao buscar usuários: ${response.status}`
      };
    }
    
    const usuarios: Usuario[] = await response.json();
    
    const usuariosPorRole: UsuariosPorRole = {
      ADMIN: [],
      PROFESSOR: [],
      RESPONSAVEL: [],
      todos: usuarios
    };

    usuarios.forEach(usuario => {
      if (usuario.roles.includes('ADMIN')) {
        usuariosPorRole.ADMIN.push(usuario);
      }
      
      if (usuario.roles.includes('PROFESSOR')) {
        usuariosPorRole.PROFESSOR.push(usuario);
      }
      
      if (usuario.roles.includes('RESPONSAVEL')) {
        usuariosPorRole.RESPONSAVEL.push(usuario);
      }
    });
    
    return {
      success: true,
      data: usuariosPorRole
    };
  } catch (error) {
    console.error('Erro ao buscar usuários ativos:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar usuários ativos'
    };
  }
}
