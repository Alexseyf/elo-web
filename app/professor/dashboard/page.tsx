'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthUser, handleLogout, checkUserRole } from '../../utils/auth';

export default function ProfessorDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (checkUserRole(router, 'PROFESSOR')) {
      setUserData(getAuthUser());
    }
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
          <h1 className="text-2xl font-bold">Dashboard Professor</h1>
          
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">Olá, {userData.nome}</p>
              <p className="text-sm text-gray-600">Professor</p>
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
            <h2 className="mb-4 text-xl font-semibold">Bem-vindo ao Dashboard do Professor</h2>
            <p className="text-gray-600">
              Aqui você pode gerenciar suas turmas e alunos.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Minhas Turmas</h2>
            <p className="mb-4 text-gray-600">
              Visualizar e gerenciar suas turmas.
            </p>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Acessar
            </button>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold">Avaliações</h2>
            <p className="mb-4 text-gray-600">
              Criar e gerenciar avaliações.
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
