'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../../components';
import { getObjetivos } from '../../../utils/objetivos';
import { getGrupos, Grupo, formatarNomeGrupo } from '../../../utils/grupos';
import { getCamposExperiencia, formatarCampoExperiencia } from '../../../utils/campos';
import { checkUserRole, getAuthUser, handleLogout } from '../../../utils/auth';

export default function ListarObjetivos() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [objetivos, setObjetivos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [campos, setCampos] = useState<any[]>([]);

  useEffect(() => {
    if (checkUserRole(router, 'ADMIN')) {
      setUserData(getAuthUser());
      carregarDados();
    }
  }, [router]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      const [objetivosData, gruposData, camposResult] = await Promise.all([
        getObjetivos(),
        getGrupos(),
        getCamposExperiencia()
      ]);

      setObjetivos(objetivosData || []);
      setGrupos(gruposData || []);
      if (camposResult && camposResult.success && camposResult.data) {
        setCampos(camposResult.data);
      } else if (Array.isArray(camposResult)) {
        setCampos(camposResult);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMensagem({ texto: 'Erro ao carregar dados', tipo: 'erro' });
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = () => handleLogout();

  const getGrupoColor = (grupoId: number | undefined) => {
    if (!grupoId) return 'bg-gray-50';
    
    const grupo = grupos.find(g => g.id === grupoId);
    if (!grupo) return 'bg-gray-50';
    
    const nome = grupo.nome.toLowerCase();
    
    if (nome.includes('bebes')) return 'bg-blue-50';
    if (nome.includes('bem_pequenas') || nome.includes('bem_pequenos')) return 'bg-green-50';
    if (nome.includes('_pequenas') || nome.includes('_pequenos')) return 'bg-amber-50';
    return 'bg-gray-50';
  };

  if (!userData) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

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
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar
        items={sidebarItems}
        activeSection="atividades"
        setActiveSection={(id) => {
          if (id === 'visao-geral') {
            router.push('/admin/dashboard');
          } else {
            router.push(`/admin/dashboard?section=${id}`);
          }
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userData={userData}
        onLogout={onLogout}
      />

      <div className="flex-1">
        <header className="bg-white shadow-sm p-4 flex items-center md:hidden z-40">
          <button
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </header>

        <main className="p-4 md:pt-6 lg:p-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Objetivos</h1>
              <p className="text-sm text-gray-600 mt-1">Listagem de objetivos cadastrados</p>
            </div>

            <div className="mt-3 md:mt-0">
              <button
                onClick={() => router.push('/admin/objetivos/cadastrar')}
                className="py-2 px-4 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
              >
                Novo Objetivo
              </button>
            </div>
          </div>

          {mensagem && (
            <div className={`p-4 mb-6 rounded-md ${mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              <p>{mensagem.texto}</p>
            </div>
          )}

          <div className="md:hidden mb-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200"></div>
              <span className="text-sm text-gray-600">Bebês</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-50 border border-green-200"></div>
              <span className="text-sm text-gray-600">Crianças Bem Pequenas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200"></div>
              <span className="text-sm text-gray-600">Crianças Pequenas</span>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            {isLoading ? (
              <div className="flex items-center justify-center">Carregando objetivos...</div>
            ) : (
              <div className="overflow-x-auto">
                {/* Tabela Mobile - formato card */}
                <div className="md:hidden space-y-3">
                  {objetivos.length === 0 ? (
                    <p className="text-center text-sm text-gray-500">Nenhum objetivo encontrado.</p>
                  ) : (
                    objetivos.map((obj: any) => (
                      <div key={obj.id} className={`rounded-lg p-4 space-y-2 ${getGrupoColor(obj.grupoId)}`}>
                        <div className="text-xs font-semibold text-gray-500 uppercase">
                          {(campos.find(c => c.id === obj.campoExperienciaId) && (formatarCampoExperiencia((campos.find(c => c.id === obj.campoExperienciaId) as any).campoExperiencia) || (campos.find(c => c.id === obj.campoExperienciaId) as any).nome)) || '—'}
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{obj.codigo}</div>
                        <div className="text-sm text-gray-700">{obj.descricao}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Tabela Desktop - com coluna Grupo */}
                <table className="hidden md:table min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Código</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {objetivos.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Nenhum objetivo encontrado.</td>
                      </tr>
                    ) : (
                      objetivos.map((obj: any) => (
                        <tr key={obj.id}>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-16">{obj.codigo}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-md">{obj.descricao}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(grupos.find(g => g.id === obj.grupoId) && formatarNomeGrupo((grupos.find(g => g.id === obj.grupoId) as Grupo).nome)) || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(campos.find(c => c.id === obj.campoExperienciaId) && (formatarCampoExperiencia((campos.find(c => c.id === obj.campoExperienciaId) as any).campoExperiencia) || (campos.find(c => c.id === obj.campoExperienciaId) as any).nome)) || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
