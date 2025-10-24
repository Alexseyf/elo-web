import config from '../../config';

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResult {
  success: boolean;
  token?: string;
  error?: string;
  id?: number;
  roles?: string[];
  primeiroAcesso?: boolean;
  message?: string;
}

export async function handleLogin(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    if (!credentials.email || !credentials.senha) {
      return {
        success: false,
        error: 'Campo obrigatório. Preencha todos os campos.'
      };
    }

    const emailSemEspacos = credentials.email.trim();

    const response = await fetch(`${config.API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailSemEspacos,
        senha: credentials.senha
      }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('A resposta não é um JSON válido:', await response.text());
      return {
        success: false,
        error: 'Resposta inválida do servidor. Verifique a URL da API.'
      };
    }
    
    const data = await response.json();
    
    if (response.status === 200 || response.status === 201) {
      if (data.token) {
        localStorage.setItem('@auth_token', data.token);
        localStorage.setItem('@user_id', data.id.toString());
        localStorage.setItem('@user_data', JSON.stringify(data));
        localStorage.setItem('role', data.roles[0]);
      }
      
      return {
        success: true,
        token: data.token,
        id: data.id,
        roles: data.roles,
        primeiroAcesso: data.primeiroAcesso
      };
    } else {
      return {
        success: false,
        error: 'Usuário ou senha inválidos'
      };
    }
  } catch (error) {
    console.error('Erro durante o login:', error);
    
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return {
        success: false,
        error: 'Erro ao processar resposta do servidor. Verifique se a URL da API está correta.'
      };
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Não foi possível conectar ao servidor. Verifique sua conexão de internet e a URL da API.'
      };
    }
    
    return {
      success: false,
      error: 'Erro ao conectar com o servidor. Tente novamente.'
    };
  }
}

export function isAuthenticated(): boolean {
  return localStorage.getItem('@auth_token') !== null;
}

export function getAuthUser(): any | null {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    const userData = localStorage.getItem('@user_data');
    if (!userData) {
      console.warn('Token existe mas dados do usuário não encontrados');
      handleLogout();
      return null;
    }
    
    const parsedData = JSON.parse(userData);
    if (!parsedData.id || !parsedData.roles) {
      console.warn('Dados do usuário incompletos ou inválidos');
      handleLogout();
      return null;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Erro ao processar dados do usuário:', error);
    handleLogout();
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('@auth_token');
}

export function getUserId(): string | null {
  return localStorage.getItem('@user_id');
}

export function handleLogout(): void {
  localStorage.removeItem('@auth_token');
  localStorage.removeItem('@user_id');
  localStorage.removeItem('@user_data');
  localStorage.removeItem('role');
  window.location.href = '/login';
}

export function handleAuthError(response: Response): boolean {
  if (response.status === 401) {
    handleLogout();
    return true;
  }
  return false;
}

export function checkUserRole(router: any, expectedRole: string): boolean {
  if (!isAuthenticated()) {
    router.push('/login');
    return false;
  }

  const user = getAuthUser();
  
  if (!user?.roles || !user.roles.includes(expectedRole)) {
    if (user?.roles?.includes('ADMIN')) {
      router.push('/admin/dashboard');
    } else if (user?.roles?.includes('PROFESSOR')) {
      router.push('/professor/dashboard');
    } else if (user?.roles?.includes('RESPONSAVEL')) {
      router.push('/responsavel/dashboard');
    } else {
      handleLogout();
    }
    return false;
  }
  
  return true;
}

export async function checkApiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${config.API_URL}/status`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(url, { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 404) {
        return { 
          success: true, 
          message: 'Conexão com o servidor estabelecida com sucesso.' 
        };
      } else {
        return { 
          success: false, 
          message: `Servidor respondeu com status: ${response.status}` 
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Erro ao verificar conexão com API:', error);
    
    let errorMessage = 'Não foi possível conectar ao servidor';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Tempo limite de conexão excedido';
      } else {
        errorMessage = `${errorMessage}: ${error.message}`;
      }
    }
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
}
