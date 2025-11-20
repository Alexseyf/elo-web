'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated, getAuthUser } from './utils/auth';
import config from '../config';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
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
        console.error('Erro ao verificar autenticação:', error);
        setLoading(false);
      }
    };
    
    checkAuthAndRedirect();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
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
          <h1 className="text-2xl font-bold mb-4">Bem-vindo ao ELO Escola</h1>
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
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} ELO Escola</p>
      </footer>
    </div>
  );
}
