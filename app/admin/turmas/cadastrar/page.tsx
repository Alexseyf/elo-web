'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../../../components';
import { checkUserRole, getAuthUser, handleLogout } from '../../../utils/auth';
import { TURMA, cadastrarTurma, formatarNomeTurma } from '../../../utils/turmas';

export default function CadastrarTurma() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [activeSection, setActiveSection] = useState('turmas');
  
  const [formData, setFormData] = useState({
    nome: '' as TURMA
  });
  
  const [errors, setErrors] = useState({
    nome: ''
  });

  useEffect(() => {
    if (checkUserRole(router, 'ADMIN')) {
      setUserData(getAuthUser());
    }
  }, [router]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      nome: ''
    };
    
    if (!formData.nome) {
      newErrors.nome = 'Selecione uma turma';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMensagem(null);
    
    try {
      const resultado = await cadastrarTurma({
        nome: formData.nome.toUpperCase() as TURMA
      });
      
      if (!resultado.success) {
        throw new Error(resultado.message || 'Erro ao cadastrar turma');
      }
      
      setMensagem({
        texto: 'Turma cadastrada com sucesso!',
        tipo: 'sucesso'
      });
      
      setFormData({ nome: '' as TURMA });
      
    } catch (error: any) {
      setMensagem({
        texto: error.message || 'Erro ao cadastrar turma',
        tipo: 'erro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value as TURMA });
  };

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

  const onLogout = () => {
    handleLogout();
  };

  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar
        items={sidebarItems}
        activeSection="turmas"
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

        <div className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                Cadastrar Nova Turma
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 max-w-md">
            <div className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium leading-6 text-gray-900">
                  Turma
                </label>
                <div className="mt-2">
                  <select
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${
                      errors.nome ? 'ring-red-500' : ''
                    }`}
                  >
                    <option value="">Selecione uma turma</option>
                    {Object.values(TURMA).map((turma) => (
                      <option key={turma} value={turma}>
                        {formatarNomeTurma(turma)}
                      </option>
                    ))}
                  </select>
                  {errors.nome && (
                    <p className="mt-2 text-sm text-red-600">{errors.nome}</p>
                  )}
                </div>
              </div>

              {mensagem && (
                <div className={`rounded-md p-4 ${
                  mensagem.tipo === 'sucesso' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <p className={`text-sm ${
                    mensagem.tipo === 'sucesso' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {mensagem.texto}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}