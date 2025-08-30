'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthUser, handleLogout } from '../../utils/auth';

export default function ResponsavelDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = getAuthUser();
    if (!user?.roles || !user.roles.includes('RESPONSAVEL')) {
      if (user?.roles?.includes('ADMIN')) {
        router.push('/admin/dashboard');
      } else if (user?.roles?.includes('PROFESSOR')) {
        router.push('/professor/dashboard');
      } else {
        handleLogout();
      }
      return;
    }
    
    setUserData(user);
  }, [router]);

  const onLogout = () => {
    handleLogout();
  };

  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-lg bg-white p-4 shadow">
          <h1 className="text-2xl font-bold">Dashboard Responsável</h1>
          
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">Olá, {userData.nome}</p>
              <p className="text-sm text-gray-600">Responsável</p>
            </div>
            
            <button
              onClick={onLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </header>
        
        <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Bem-vindo ao Dashboard do Responsável</h2>
            <p className="text-gray-600">
              Aqui você pode acompanhar o progresso dos alunos.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Alunos</h2>
            <p className="mb-4 text-gray-600">
              Visualizar informações dos alunos vinculados.
            </p>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Acessar
            </button>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Relatórios</h2>
            <p className="mb-4 text-gray-600">
              Visualizar relatórios de desempenho.
            </p>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Acessar
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
