'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isAuthenticated, getAuthUser, handleLogout } from '../../utils/auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('visao-geral');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getAuthUser();
    
    if (!user?.roles || !user.roles.includes('ADMIN')) {
      if (user?.roles?.includes('PROFESSOR')) {
        router.push('/professor/dashboard');
      } else if (user?.roles?.includes('RESPONSAVEL')) {
        router.push('/responsavel/dashboard');
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

  const sidebarItems = [
    { id: 'visao-geral', label: 'Visão Geral', href: '#visao-geral' },
    { id: 'usuarios', label: 'Usuários', href: '#usuarios' },
    { id: 'alunos', label: 'Alunos', href: '#alunos' },
    { id: 'turmas', label: 'Turmas', href: '#turmas' },
    { id: 'diarios', label: 'Diários', href: '#diarios' },
    { id: 'atividades', label: 'Atividades Pedagógicas', href: '#atividades' },
    { id: 'calendario', label: 'Calendário', href: '#calendario' },
    { id: 'cronograma', label: 'Cronograma Anual', href: '#cronograma' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-md">

      <div className="p-4 border-b flex items-center">
        <Image
          src="/logo.png"
          alt="Elo Escola"
          width={60}
          height={60}
          className="mr-3"
        />
        <div>
          <h2 className="text-xl font-bold">Elo Escola</h2>
          <p className="text-sm text-gray-600">Painel Administrativo</p>
        </div>
      </div>
        
        <nav className="p-2">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.id} className="mb-1">
                <a
                  href={item.href}
                  onClick={() => setActiveSection(item.id)}
                  className={`block rounded-md px-4 py-2 text-sm transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 border-t p-4">
          <div className="mb-2">
            <p className="font-medium text-sm">{userData.nome}</p>
            <p className="text-xs text-gray-600">{userData.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </aside>
      <div className="flex-1 p-8">
        <header className="mb-8 flex items-center justify-between">
        </header>
        
        <main>
          <section id="visao-geral" className={activeSection === 'visao-geral' ? 'block' : 'hidden'}>
            <h2 className="mb-6 text-xl font-semibold">Visão Geral</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">Bem-vindo ao Dashboard</h3>
                <p className="text-gray-600">
                  Aqui você pode gerenciar todos os aspectos do sistema.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">Atividades Recentes</h3>
                <p className="text-gray-600">
                  Visualize as últimas atividades do sistema.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold">Estatísticas</h3>
                <p className="text-gray-600">
                  Resumo dos principais números do sistema.
                </p>
              </div>
            </div>
          </section>
          <section id="usuarios" className={activeSection === 'usuarios' ? 'block' : 'hidden'}>
            <h2 className="mb-6 text-xl font-semibold">Gerenciamento de Usuários</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="mb-4">Adicione, edite ou remova usuários do sistema.</p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Adicionar Usuário
              </button>
            </div>
          </section>
          
          <section id="alunos" className={activeSection === 'alunos' ? 'block' : 'hidden'}>
            <h2 className="mb-6 text-xl font-semibold">Gerenciamento de Alunos</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="mb-4">Gerencie os alunos cadastrados no sistema.</p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Adicionar Aluno
              </button>
            </div>
          </section>
          
          <section id="turmas" className={activeSection === 'turmas' ? 'block' : 'hidden'}>
            <h2 className="mb-6 text-xl font-semibold">Gerenciamento de Turmas</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="mb-4">Crie e gerencie turmas e suas configurações.</p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Criar Nova Turma
              </button>
            </div>
          </section>
          
          <section id="diarios" className={activeSection === 'diarios' ? 'block' : 'hidden'}>
            <h2 className="mb-6 text-xl font-semibold">Diários</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="mb-4">Acompanhe e gerencie os diários de classe.</p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Visualizar Diários
              </button>
            </div>
          </section>
          
          <section id="atividades" className={activeSection === 'atividades' ? 'block' : 'hidden'}>
            <h2 className="mb-6 text-xl font-semibold">Atividades Pedagógicas</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="mb-4">Gerencie as atividades pedagógicas do sistema.</p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Criar Atividade
              </button>
            </div>
          </section>
          
          <section id="calendario" className={activeSection === 'calendario' ? 'block' : 'hidden'}>
            <h2 className="mb-6 text-xl font-semibold">Calendário</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="mb-4">Visualize e gerencie o calendário escolar.</p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Adicionar Evento
              </button>
            </div>
          </section>
          
          <section id="cronograma" className={activeSection === 'cronograma' ? 'block' : 'hidden'}>
            <h2 className="mb-6 text-xl font-semibold">Cronograma Anual</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="mb-4">Configure o cronograma anual de atividades.</p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Definir Cronograma
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
