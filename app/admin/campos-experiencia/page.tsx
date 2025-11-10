'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../components';
import { checkUserRole, getAuthUser, handleLogout } from '../../utils/auth';
import { 
  CAMPO_EXPERIENCIA, 
  formatarCampoExperiencia, 
  createCampoExperiencia, 
  getCamposExperiencia,
  CampoExperienciaResponse 
} from '../../utils/campos';

export default function CamposExperienciaPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [loadingCampos, setLoadingCampos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCampos, setErrorCampos] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CAMPO_EXPERIENCIA | ''>('');
  const [camposCadastrados, setCamposCadastrados] = useState<CampoExperienciaResponse[]>([]);

  useEffect(() => {
    if (checkUserRole(router, 'ADMIN')) {
      setUserData(getAuthUser());
      loadCamposCadastrados();
    }
  }, [router]);

  const loadCamposCadastrados = async () => {
    setLoadingCampos(true);
    setErrorCampos(null);

    try {
      const result = await getCamposExperiencia();
      if (result.success && result.data) {
        setCamposCadastrados(result.data);
      } else {
        setErrorCampos(result.message);
      }
    } catch (err) {
      setErrorCampos('Erro ao carregar campos de experiência');
      console.error(err);
    } finally {
      setLoadingCampos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampo) {
      setError('Selecione um campo de experiência');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await createCampoExperiencia(selectedCampo as CAMPO_EXPERIENCIA);
      
      if (result.success) {
        setSuccessMessage('Campo de experiência cadastrado com sucesso!');
        setSelectedCampo('');
        loadCamposCadastrados();
      } else {
        setError(result.message || 'Erro ao cadastrar campo de experiência');
      }
    } catch (err) {
      setError('Erro ao processar a requisição');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    handleLogout();
  };

  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  const camposDisponiveis = Object.values(CAMPO_EXPERIENCIA).filter(
    campo => !camposCadastrados.some(c => c.campoExperiencia === campo)
  );

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
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Campos de Experiência</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie os campos de experiência disponíveis no sistema
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cadastrar Novo Campo</h2>
              
              {(error || successMessage) && (
                <div className={`p-4 mb-6 rounded-md ${
                  successMessage 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <p>{successMessage || error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="campo" className="block text-sm font-medium text-gray-700 mb-1">
                      Campo de Experiência*
                    </label>
                    <select
                      id="campo"
                      value={selectedCampo}
                      onChange={(e) => setSelectedCampo(e.target.value as CAMPO_EXPERIENCIA | '')}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                        ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                      disabled={loading || camposDisponiveis.length === 0}
                    >
                      <option value="">Selecione um campo...</option>
                      {camposDisponiveis.map((campo) => (
                        <option key={campo} value={campo}>
                          {formatarCampoExperiencia(campo)}
                        </option>
                      ))}
                    </select>
                    {camposDisponiveis.length === 0 && (
                      <p className="mt-2 text-sm text-gray-500">
                        Todos os campos de experiência já foram cadastrados.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="submit"
                      disabled={loading || camposDisponiveis.length === 0}
                      className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                          <span>Cadastrando...</span>
                        </div>
                      ) : (
                        'Cadastrar Campo'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/admin/dashboard?section=atividades')}
                      className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Campos Cadastrados</h2>
              </div>
              
              {loadingCampos ? (
                <div className="px-6 py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : errorCampos ? (
                <div className="p-6 text-center">
                  <p className="text-red-600">{errorCampos}</p>
                  <button 
                    onClick={loadCamposCadastrados}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : camposCadastrados.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  Nenhum campo de experiência cadastrado.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {camposCadastrados.map((campo) => (
                    <li key={campo.id} className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatarCampoExperiencia(campo.campoExperiencia)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
