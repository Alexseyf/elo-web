'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserRole } from '../../utils/auth';
import { 
  CAMPO_EXPERIENCIA, 
  formatarCampoExperiencia, 
  createCampoExperiencia, 
  getCamposExperiencia,
  CampoExperienciaResponse 
} from '../../utils/campos';

export default function CamposExperienciaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCampos, setLoadingCampos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCampos, setErrorCampos] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CAMPO_EXPERIENCIA | ''>('');
  const [camposCadastrados, setCamposCadastrados] = useState<CampoExperienciaResponse[]>([]);

  useEffect(() => {
    checkUserRole(router, 'ADMIN');
    loadCamposCadastrados();
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

  const camposDisponiveis = Object.values(CAMPO_EXPERIENCIA).filter(
    campo => !camposCadastrados.some(c => c.campoExperiencia === campo)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Campos de Experiência</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie os campos de experiência do sistema
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Cadastrar Novo Campo</h2>
          
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="campo" className="block text-sm font-medium text-gray-700 mb-1">
                Campo de Experiência
              </label>
              <select
                id="campo"
                value={selectedCampo}
                onChange={(e) => setSelectedCampo(e.target.value as CAMPO_EXPERIENCIA | '')}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            <button
              type="submit"
              disabled={loading || camposDisponiveis.length === 0}
              className={`w-full sm:w-auto px-4 py-2 rounded-md text-white font-medium ${
                loading || camposDisponiveis.length === 0
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cadastrando...
                </span>
              ) : (
                'Cadastrar Campo'
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium">Campos de Experiência</h2>
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
    </div>
  );
}
