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
        <main className="p-4 md:pt-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Objetivos</h1>
              <p className="text-sm text-gray-600 mt-1">Listagem de objetivos cadastrados</p>
            </div>
            <div>
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

          <div className="bg-white shadow-md rounded-lg p-6">
            {isLoading ? (
              <div className="flex items-center justify-center">Carregando objetivos...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{obj.codigo}</td>
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
