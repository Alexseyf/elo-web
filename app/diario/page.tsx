'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/app/components';
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
} from '@/app/utils/auth';
import { getSidebarItems } from '@/app/utils/sidebarItems';
import { getAlunos, getAlunosByTurma, Aluno } from '@/app/utils/alunos';
import { getTurmas } from '@/app/utils/turmas';

interface DiarioCard {
  id: string;
  alunoNome: string;
  data: string;
  disposicao: string;
  evacuacao: string;
  observacoes: string;
}

export default function DiarioPage() {
  const router = useRouter();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<{id: number; nome: string}[]>([]);
  const [turmaFiltro, setTurmaFiltro] = useState<number>(0);
  const [diarios, setDiarios] = useState<DiarioCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('diarios');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<ReturnType<typeof getSidebarItems>>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = getAuthUser();
    setUserData(user);
    if (user?.roles?.[0]) {
      setSidebarItems(getSidebarItems(user.roles[0]));
    }
    carregarTurmas();
    carregarAlunos(); // Sempre carrega todos os alunos
  }, [router]);

  const carregarTurmas = async () => {
    const listaTurmas = await getTurmas();
    setTurmas(listaTurmas);
  };

  const carregarAlunos = async () => {
    setIsLoading(true);
    const listaAlunos = await getAlunos(); // Sempre busca todos os alunos
    setAlunos(listaAlunos);
    setIsLoading(false);
  };

  const handleTurmaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTurmaFiltro(Number(e.target.value)); // Só altera o filtro visual
  };

  const loadDiarios = async () => {
    try {
      setIsLoading(true);

      const mockDiarios: DiarioCard[] = [
        {
          id: '1',
          alunoNome: 'João Silva',
          data: '2024-11-12',
          disposicao: 'Alegre',
          evacuacao: 'Normal',
          observacoes: 'Criança bem disposta durante o dia',
        },
        {
          id: '2',
          alunoNome: 'Maria Santos',
          data: '2024-11-11',
          disposicao: 'Normal',
          evacuacao: 'Diarreia',
          observacoes: 'Apresentou diarreia após o almoço',
        },
      ];

      setDiarios(mockDiarios);
    } catch (error) {
      console.error('Erro ao carregar diários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const alunosFiltrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const diariosFiltrados = diarios.filter((d) =>
    d.alunoNome.toLowerCase().includes(filtro.toLowerCase())
  );

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
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                ☰
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Diários</h1>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Buscar por aluno..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={turmaFiltro}
                onChange={handleTurmaChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Todas as turmas</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>{turma.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando alunos...</p>
            </div>
          ) : alunosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg mb-4">
                {filtro ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {turmas.filter(turma => turmaFiltro === 0 || turma.id === turmaFiltro).map(turma => {
                const alunosTurma = alunosFiltrados.filter(a => a.turma?.id === turma.id);
                if (alunosTurma.length === 0) return null;
                return (
                  <div key={turma.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 border-b border-blue-200 px-3 md:px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base md:text-lg font-semibold text-blue-800 truncate">
                          {turma.nome}
                        </h3>
                        <span className="text-xs md:text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full whitespace-nowrap">
                          {alunosTurma.length} aluno{alunosTurma.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                        {alunosTurma.map(aluno => (
                          <Link
                            key={aluno.id}
                            href={`/diario/visualizar/${aluno.id}`}
                            className="relative bg-white border rounded-lg p-3 md:p-4 transition-all cursor-pointer group border-gray-200 hover:border-blue-300 hover:shadow-md"
                          >
                            <div className="flex items-center space-x-2 md:space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center bg-blue-100 group-hover:bg-blue-200">
                                  <svg
                                    className="w-4 md:w-5 h-4 md:h-5 text-blue-600"
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
                                <p className="text-xs md:text-sm font-medium truncate text-gray-900">
                                  {aluno.nome}
                                </p>
                                {aluno.email && (
                                  <p className="text-xs text-gray-500 truncate hidden md:block">
                                    {aluno.email}
                                  </p>
                                )}
                              </div>
                              <div className="flex-shrink-0 hidden md:block">
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
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
