'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isAuthenticated, getAuthUser, handleLogout, checkUserRole } from '../../utils/auth';
import { SidebarHeader, UsersTable } from '../../components';
import { fetchTurmas, Turma, TurmaComTotalAlunos, formatarNomeTurma, fetchTotalAlunosPorTurma } from '../../utils/turmas';
import { fetchUsuariosAtivos, Usuario, UsuariosPorRole } from '../../utils/usuarios';

export default function AdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('visao-geral');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmasComTotalAlunos, setTurmasComTotalAlunos] = useState<TurmaComTotalAlunos[]>([]);
  const [usuarios, setUsuarios] = useState<UsuariosPorRole | null>(null);
  const [loadingUsuarios, setLoadingUsuarios] = useState<boolean>(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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

  useEffect(() => {
    if (checkUserRole(router, 'ADMIN')) {
      setUserData(getAuthUser());
      
      // Verifica se há um parâmetro de seção na URL
      const urlParams = new URLSearchParams(window.location.search);
      const sectionParam = urlParams.get('section');
      if (sectionParam && sidebarItems.some(item => item.id === sectionParam)) {
        setActiveSection(sectionParam);
      }
    }
  }, [router]);
  
  useEffect(() => {
    if (activeSection === 'turmas') {
      loadTurmas();
      loadTotalAlunosPorTurma();
    } else if (activeSection === 'usuarios') {
      loadUsuarios();
    }
  }, [activeSection]);
  
  const loadTurmas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchTurmas();
      
      if (result.success && result.data) {
        setTurmas(result.data);
      } else {
        setError(result.error || 'Erro ao carregar turmas');
      }
    } catch (err) {
      setError('Erro inesperado ao carregar turmas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalAlunosPorTurma = async () => {
    try {
      const result = await fetchTotalAlunosPorTurma();
      
      if (result.success && result.data) {
        setTurmasComTotalAlunos(result.data);
      } else {
        console.error('Erro ao carregar total de alunos:', result.error);
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar total de alunos:', err);
    }
  };

  const loadUsuarios = async () => {
    setLoadingUsuarios(true);
    setErrorUsuarios(null);
    
    try {
      const result = await fetchUsuariosAtivos();
      
      if (result.success && result.data) {
        setUsuarios(result.data);
      } else {
        setErrorUsuarios(result.error || 'Erro ao carregar usuários');
      }
    } catch (err) {
      setErrorUsuarios('Erro inesperado ao carregar usuários');
      console.error(err);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const onLogout = () => {
    handleLogout();
  };

  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Overlay para fechar o menu em dispositivos móveis */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Menu lateral */}
      <aside 
        className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 w-64 bg-white shadow-md z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0`}
      >
      <SidebarHeader
        onClose={() => setMobileMenuOpen(false)}
        showCloseButton={true}
      />
        
        <nav className="p-2">
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.id} className="mb-1">
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
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
        
        <div className="lg:absolute lg:bottom-0 w-full border-t p-4 mt-6 lg:mt-0">
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
      
      {/* Conteúdo principal */}
      <div className="flex-1">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          {/* Botão do menu em dispositivos móveis */}
          <button 
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>
        
        <main className="p-4 md:pt-6 lg:p-8">
          <section id="visao-geral" className={activeSection === 'visao-geral' ? 'block' : 'hidden'}>
            <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold">Visão Geral</h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-white p-4 md:p-6 shadow">
                <h3 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">Bem-vindo ao Dashboard</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Aqui você pode gerenciar todos os aspectos do sistema.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-4 md:p-6 shadow">
                <h3 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">Atividades Recentes</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Visualize as últimas atividades do sistema.
                </p>
              </div>
              
              <div className="rounded-lg bg-white p-4 md:p-6 shadow">
                <h3 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">Estatísticas</h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Resumo dos principais números do sistema.
                </p>
              </div>
            </div>
          </section>

          {/* Lista usuários do sistema - UsersTable.tsx */}
          <section id="usuarios" className={activeSection === 'usuarios' ? 'block' : 'hidden'}>
            <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold">Gerenciamento de Usuários</h2>
            
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <h3 className="text-base md:text-lg font-medium">Lista de Usuários</h3>
                <p className="text-xs md:text-sm text-gray-600">Visualize e gerencie os usuários do sistema</p>
              </div>
              <button 
                className="rounded bg-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 text-white hover:bg-blue-700 flex items-center text-xs sm:text-sm self-start sm:self-auto"
                onClick={() => router.push('/admin/usuarios/cadastrar')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Adicionar Usuário</span>
              </button>
            </div>
            
            {loadingUsuarios ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : errorUsuarios ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{errorUsuarios}</p>
                <button 
                  onClick={loadUsuarios} 
                  className="mt-2 text-xs sm:text-sm underline hover:text-red-800"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                {usuarios && (
                  <div className="space-y-6">
                    {/* Administradores */}
                    <UsersTable 
                      title="Administradores"
                      users={usuarios.ADMIN}
                      loading={false}
                      error={null}
                      onRetry={loadUsuarios}
                    />
                    
                    {/* Professores */}
                    <UsersTable 
                      title="Professores"
                      users={usuarios.PROFESSOR}
                      loading={false}
                      error={null}
                      onRetry={loadUsuarios}
                    />
                    
                    {/* Responsáveis */}
                    <UsersTable 
                      title="Responsáveis"
                      users={usuarios.RESPONSAVEL}
                      loading={false}
                      error={null}
                      onRetry={loadUsuarios}
                    />
                  </div>
                )}
              </>
            )}
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
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Lista de Turmas</h3>
                <p className="text-sm text-gray-600">Visualize e gerencie as turmas cadastradas</p>
              </div>
              <button 
                className="rounded bg-blue-600 px-3 py-1.5 sm:px-4 sm:py-2 text-white hover:bg-blue-700 flex items-center text-xs sm:text-sm"
                onClick={() => {/* Implementar navegação para formulário de criação */}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Criar Nova</span> Turma
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
                <button 
                  onClick={loadTurmas} 
                  className="mt-2 text-sm underline hover:text-red-800"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                {turmas.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">Nenhuma turma encontrada</p>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => {/* Implementar navegação para formulário de criação */}}
                    >
                      Criar primeira turma
                    </button>
                  </div>
                ) : (
                  <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Professores
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alunos
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {turmas.map((turma) => (
                          <tr key={turma.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {turma.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {turma.professores.length > 0 
                                ? turma.professores.map(p => p.usuario.nome).join(', ') 
                                : 'Nenhum professor'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {turmasComTotalAlunos.find(t => t.id === turma.id)?.totalAlunosAtivos || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <button
                                  className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-xs"
                                  onClick={() => {/* Implementar visualização detalhada */}}
                                >
                                  Detalhes
                                </button>
                                <button
                                  className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-2 py-1 rounded text-xs"
                                  onClick={() => {/* Implementar edição */}}
                                >
                                  Editar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
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
