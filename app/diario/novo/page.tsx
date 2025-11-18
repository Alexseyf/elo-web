'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components';
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
  getAuthToken,
} from '@/utils/auth';
import { getTurmasProfessor, type TurmaProfessor, type Aluno as AlunoProf } from '@/utils/professores';
import { verificarRegistroDiarioAluno } from '@/utils/alunos';
import DiarioStepper from '../components/DiarioStepper';
import type { DiarioFormData } from '@/types/diario';
import { formatarNomeTurma } from '@/utils/turmas';
import config from '@/config';

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
  const [alunosComDiario, setAlunosComDiario] = useState<Set<number>>(new Set());
  const [loadingDiariosStatus, setLoadingDiariosStatus] = useState(false);

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
        await carregarStatusDiarios(alunos);
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

  const carregarStatusDiarios = async (alunos: AlunoProf[]) => {
    try {
      setLoadingDiariosStatus(true);

      const verificacoes = alunos.map(aluno =>
        verificarRegistroDiarioAluno(aluno.id)
          .then(resultado => ({
            alunoId: aluno.id,
            temDiario: resultado?.temDiario ?? false
          }))
          .catch(err => {
            console.error(`Erro ao verificar diário do aluno ${aluno.id}:`, err);
            return { alunoId: aluno.id, temDiario: false };
          })
      );

      const resultados = await Promise.all(verificacoes);
      const alunosComDiarioSet = new Set<number>();
      resultados.forEach(resultado => {
        if (resultado.temDiario) {
          alunosComDiarioSet.add(resultado.alunoId);
        }
      });
      
      setAlunosComDiario(alunosComDiarioSet);
    } catch (err) {
      console.error('Erro ao carregar status de diários:', err);
      setAlunosComDiario(new Set());
    } finally {
      setLoadingDiariosStatus(false);
    }
  };

  const formatPeriodosSono = (periodos: any[]) => {
    return periodos
      .filter(periodo => periodo.saved)
      .map(periodo => ({
        horaDormiu: periodo.horaDormiu,
        horaAcordou: periodo.horaAcordou,
        tempoTotal: periodo.tempoTotal
      }));
  };

  const ITENS_PROVIDENCIA_VALIDOS = [
    'FRALDA',
    'LENCO_UMEDECIDO',
    'LEITE',
    'CREME_DENTAL',
    'ESCOVA_DE_DENTE',
    'POMADA'
  ];

  const ItensProvidencia = (itens: string[]): string[] => {
    if (!Array.isArray(itens)) {
      return [];
    }
    return itens.filter(item => ITENS_PROVIDENCIA_VALIDOS.includes(item));
  };

  const handleSubmit = async (data: DiarioFormData) => {
    if (!alunoSelecionado?.id) {
      setError('Aluno não selecionado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        setTimeout(() => {
          localStorage.removeItem('@auth_token');
          localStorage.removeItem('@user_data');
          localStorage.removeItem('@user_id');
          router.push('/login');
        }, 2000);
        return;
      }

      const dadosParaEnviar = {
        alunoId: alunoSelecionado.id,
        data: new Date().toISOString(),
        lancheManha: data.cafeDaManha,
        almoco: data.almoco,
        lancheTarde: data.lancheDaTarde,
        leite: data.leite,
        evacuacao: data.evacuacao,
        disposicao: data.disposicao,
        periodosSono: formatPeriodosSono(data.sono),
        itensProvidencia: ItensProvidencia(data.itensRequisitados),
        observacoes: data.observacoes || ''
      };

      console.log('Enviando dados:', dadosParaEnviar);

      const response = await fetch(`${config.API_URL}/diarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosParaEnviar)
      });

      const responseData = await response.json().catch(() => null);

      if (response.ok) {
        console.log('Diário salvo com sucesso:', responseData);

        window.location.href = '/diario/novo';
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('@auth_token');
          localStorage.removeItem('@user_data');
          localStorage.removeItem('@user_id');
          setError('Sessão expirada. Por favor, faça login novamente.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        let errorMessage = 'Não foi possível salvar o diário.';
        let detalhesErro = null;
        
        if (responseData) {
          if (typeof responseData.erro === 'string') {
            errorMessage = responseData.erro;
          } else if (responseData.erro && typeof responseData.erro === 'object') {
            if (responseData.erro.name === 'ZodError' && responseData.erro.issues) {
              const primeiroErro = responseData.erro.issues[0];
              errorMessage = `Erro de validação: ${primeiroErro.message || 'Dados inválidos'}`;
              if (primeiroErro.path && primeiroErro.path.length > 0) {
                errorMessage += ` (Campo: ${primeiroErro.path.join('.')})`;
              }
              detalhesErro = responseData.erro.issues;
            } else {
              errorMessage = 'Erro de validação nos dados enviados.';
              detalhesErro = responseData.erro;
            }
            console.error('Detalhes do erro de validação:', detalhesErro);
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.detalhes) {
            errorMessage = responseData.detalhes;
          }
        }

        setError(errorMessage);
        console.error('Erro ao salvar diário:', { 
          status: response.status, 
          mensagem: errorMessage,
          detalhes: detalhesErro 
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      setError('Erro de conexão. Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
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
                    <div>
                      {loadingDiariosStatus && (
                        <div className="mb-4 flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                          <span className="text-sm text-blue-700">Verificando diários registrados...</span>
                        </div>
                      )}
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
                                {turma.alunos.map(aluno => {
                                  const temDiario = alunosComDiario.has(aluno.id);
                                  return (
                                    <div
                                      key={aluno.id}
                                      onClick={() => !temDiario && setAlunoSelecionado({
                                        ...aluno,
                                        turma: { id: turma.id, nome: turma.nome }
                                      } as AlunoProf & { turma: { id: number; nome: string } })}
                                      className={`relative bg-white border rounded-lg p-4 transition-all cursor-pointer group ${
                                        temDiario
                                          ? 'border-green-200 bg-green-50 cursor-default hover:shadow-none'
                                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                            temDiario
                                              ? 'bg-green-100'
                                              : 'bg-blue-100 group-hover:bg-blue-200'
                                          }`}>
                                            <svg
                                              className={`w-5 h-5 ${
                                                temDiario ? 'text-green-600' : 'text-blue-600'
                                              }`}
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
                                          <p className={`text-sm font-medium truncate ${
                                            temDiario ? 'text-gray-600' : 'text-gray-900'
                                          }`}>
                                            {aluno.nome}
                                          </p>
                                          {aluno.email && (
                                            <p className="text-xs text-gray-500 truncate">
                                              {aluno.email}
                                            </p>
                                          )}
                                        </div>
                                        {!temDiario && (
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
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      </div>
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
