'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, getAuthUser, checkApiConnection } from './utils/auth';
import config from '../config';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        try {
          const apiConnection = await checkApiConnection();
          if (!apiConnection.success) {
            setApiError(apiConnection.message);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar API:', error);
          setApiError('Erro ao verificar conexão com o servidor');
          setLoading(false);
          return;
        }
        if (isAuthenticated()) {
          try {
            const userData = getAuthUser();

            if (userData?.roles) {
              if (userData.roles.includes('ADMIN')) {
                router.push('/admin/dashboard');
              } 
              else if (userData.roles.includes('RESPONSAVEL')) {
                router.push('/responsavel/dashboard');
              }
              else if (userData.roles.includes('PROFESSOR')) {
                router.push('/professor/dashboard');
              }
              else {
                router.push('/login');
              }
            } else {
              router.push('/login');
            }
          } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Erro ao verificar API:', error);
        setApiError('Erro ao verificar conexão com o servidor');
        setLoading(false);
      }
    };
    
    checkAuthAndRedirect();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  if (loading && !apiError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Image
          className="mb-8 animate-pulse"
          src="/logo.png"
          alt="Elo Escola"
          width={120}
          height={30}
          priority
        />
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Image
          className="mb-8"
          src="/logo.png"
          alt="Elo Escola"
          width={120}
          height={30}
          priority
        />
        <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
          <h2 className="text-red-700 text-lg font-semibold mb-2">Erro de conexão</h2>
          <p className="text-red-600 mb-4">{apiError}</p>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p className="font-medium mb-1">Informações de depuração:</p>
            <p>API URL: {config.API_URL}</p>
          </div>
          <div className="flex mt-4 gap-2">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Tentar novamente
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          src="/logo.png"
          alt="Elo Escola"
          width={180}
          height={38}
          priority
        />
        
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold mb-4">Bem-vindo ao ELO Desktop</h1>
          <p className="mb-6">Aguarde enquanto você é redirecionado...</p>
          
          <div className="flex gap-4 justify-center sm:justify-start">
            <button 
              onClick={() => router.push('/login')}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} ELO Desktop</p>
      </footer>
    </div>
  );
}
