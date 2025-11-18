'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components';
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
} from '@/utils/auth';
import { getTurmasProfessor, type TurmaProfessor, type Aluno as AlunoProf } from '@/utils/professores';
import DiarioStepper from '../components/DiarioStepper';
import type { DiarioFormData } from '@/types/diario';
import { formatarNomeTurma } from '@/utils/turmas';

export default function NovoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('diarios');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [turmas, setTurmas] = useState<TurmaProfessor[]>([]);
  const [todosAlunos, setTodosAlunos] = useState<AlunoProf[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoProf | null>(null);
  const [loadingAlunos, setLoadingAlunos] = useState(false);

  const sidebarItems = [
    { id: 'visao-geral', label: 'Visão Geral', href: '/admin/dashboard?section=visao-geral' },
    { id: 'usuarios', label: 'Usuários', href: '/admin/dashboard?section=usuarios' },
    { id: 'alunos', label: 'Alunos', href: '/admin/dashboard?section=alunos' },
    { id: 'turmas', label: 'Turmas', href: '/admin/dashboard?section=turmas' },
    { id: 'diarios', label: 'Diários', href: '/professor/dashboard?section=diarios' },
    { id: 'atividades', label: 'Atividades Pedagógicas', href: '/admin/dashboard?section=atividades' },
    { id: 'calendario', label: 'Calendário', href: '/admin/dashboard?section=calendario' },
    { id: 'cronograma', label: 'Cronograma Anual', href: '/admin/dashboard?section=cronograma' },
  ];

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    const user = getAuthUser();
    setUserData(user);
    
    if (user && user.id) {
      loadTurmasAlunos(user.id);
    }
  }, [router]);

  const loadTurmasAlunos = async (professorId: number) => {
    try {
      setLoadingAlunos(true);
      setError(null);

      const result = await getTurmasProfessor(professorId);
      
      if (result.success && result.data) {
        setTurmas(result.data);

        const alunos: AlunoProf[] = [];
        result.data.forEach(turma => {
          turma.alunos.forEach(aluno => {
            if (!alunos.find(a => a.id === aluno.id)) {
              alunos.push({
                ...aluno,
                turma: { id: turma.id, nome: turma.nome }
              } as AlunoProf & { turma: { id: number; nome: string } });
            }
          });
        });
        
        setTodosAlunos(alunos);
      } else {
        setError(result.message || 'Erro ao carregar turmas do professor');
      }
    } catch (err) {
      console.error('Erro ao carregar turmas:', err);
      setError('Erro ao carregar dados do professor');
    } finally {
      setLoadingAlunos(false);
    }
  };

  const handleSubmit = async (data: DiarioFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implementar chamada à API
      // const response = await fetch('/api/diario', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(data),
      // });

      // if (!response.ok) {
      //   throw new Error('Erro ao salvar diário');
      // }

      // Simulação de sucesso
      console.log('Diário salvo:', data);

      // Mostrar notificação de sucesso (implementar conforme seu sistema)
      alert('Diário salvo com sucesso!');

      // Redirecionar para dashboard
      router.push('/diario');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar diário';
      setError(message);
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = () => {
    handleLogout();
    router.push('/login');
  };

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userData={userData}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-500 text-white px-6 py-3 shadow-lg">
            {error}
          </div>
        )}
        
        <div className="flex-1">
          {!alunoSelecionado ? (
            <div className="p-6 max-w-6xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                  Novo Diário
                </h1>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o aluno para o diário:
                  </label>
                  
                  {loadingAlunos ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">Carregando alunos...</span>
                    </div>
                  ) : todosAlunos.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <p className="text-yellow-700">
                        Nenhum aluno encontrado nas suas turmas. Entre em contato com o administrador.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {turmas.map(turma => (
                        <div key={turma.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Card da Turma */}
                          <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-blue-800">
                                {formatarNomeTurma(turma.nome)}
                              </h3>
                              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                {turma.alunos.length} aluno{turma.alunos.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          
                          {/* Lista de Cards dos Alunos */}
                          <div className="p-4">
                            {turma.alunos.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">
                                Nenhum aluno nesta turma
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {turma.alunos.map(aluno => (
                                  <div
                                    key={aluno.id}
                                    onClick={() => setAlunoSelecionado({
                                      ...aluno,
                                      turma: { id: turma.id, nome: turma.nome }
                                    } as AlunoProf & { turma: { id: number; nome: string } })}
                                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                          <svg
                                            className="w-5 h-5 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {aluno.nome}
                                        </p>
                                        {aluno.email && (
                                          <p className="text-xs text-gray-500 truncate">
                                            {aluno.email}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex-shrink-0">
                                        <svg
                                          className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => router.push('/professor/dashboard?section=diarios')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <DiarioStepper
                onSubmit={handleSubmit}
                isLoading={isLoading}
                editMode={false}
                alunoNome={alunoSelecionado.nome}
                onTrocarAluno={() => setAlunoSelecionado(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
