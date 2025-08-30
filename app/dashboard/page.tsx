'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getAuthUser, handleLogout } from '../utils/auth';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const userData = getAuthUser();
    setUser(userData);
  }, [router]);

  const onLogout = () => {
    handleLogout();
  };

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-lg bg-white p-4 shadow">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">Olá, {user.name}</p>
              <p className="text-sm text-gray-600">Função: {user.role}</p>
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
            <h2 className="mb-4 text-xl font-semibold">Bem-vindo ao Sistema</h2>
            <p className="text-gray-600">
              Esta é a página inicial do dashboard. Aqui você encontrará todas as
              funcionalidades disponíveis para seu nível de acesso.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
