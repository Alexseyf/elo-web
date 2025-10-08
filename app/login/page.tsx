'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogin, checkApiConnection } from '../utils/auth';
import Image from 'next/image';
import config from '../../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [showApiInfo, setShowApiInfo] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await handleLogin({ email, senha });
      
      if (result.success) {
        if (result.primeiroAcesso === true) {
          router.push(`/alterar-senha-obrigatoria?userId=${result.id}&senhaAtual=${senha}`);
          return;
        }
        
        if (result.roles && Array.isArray(result.roles)) {
          if (result.roles.includes('ADMIN')) {
            router.push('/admin/dashboard');
          } 
          else if (result.roles.includes('PROFESSOR')) {
            router.push('/professor/dashboard');
          }
          else if (result.roles.includes('RESPONSAVEL')) {
            router.push('/responsavel/dashboard');
          }
          else {
            setError('Usuário sem perfil definido');
          }
        } else {
          setError('Nenhum perfil associado à conta');
        }
      } else {
        setError(result.error || 'Falha na autenticação');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o login. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    setApiStatus('Verificando conexão...');
    try {
      const result = await checkApiConnection();
      setApiStatus(result.message);
    } catch (error) {
      setApiStatus('Erro ao verificar conexão');
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-2 flex justify-center">
          <Image
            src="/logo.png"
            alt="Elo Escola"
            width={120}
            height={30}
          />
        </div>
        
        <h1 className="mb-6 text-center text-2xl font-semibold">Login</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="senha" className="mb-2 block text-sm font-medium">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              Esqueceu a senha?
            </a>
          </div>
        </form>
        
        {/* <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={() => setShowApiInfo(!showApiInfo)}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            {showApiInfo ? 'Ocultar informações de diagnóstico' : 'Mostrar informações de diagnóstico'}
          </button>
          
          {showApiInfo && (
            <div className="mt-3 text-sm">
              <p className="mb-2"><strong>URL da API:</strong> {config.API_URL}</p>
              <p className="mb-2"><strong>Variável de ambiente:</strong> {process.env.NEXT_PUBLIC_API_URL || 'não definida'}</p>
              <button
                onClick={checkConnection}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Verificar conexão
              </button>
              
              {apiStatus && (
                <div className={`mt-2 p-2 rounded-md ${apiStatus.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {apiStatus}
                </div>
              )}
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
}
