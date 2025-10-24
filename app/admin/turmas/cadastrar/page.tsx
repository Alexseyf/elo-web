'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarHeader } from '../../../components';
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
        throw new Error(resultado.error);
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
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
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
                    if (item.id === 'visao-geral') {
                      router.push('/admin/dashboard');
                    } else if (item.id === 'turmas') {
                      setMobileMenuOpen(false);
                    } else {
                      router.push(`/admin/dashboard?section=${item.id}`);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`block rounded-md px-4 py-2 text-sm transition-colors ${
                    item.id === 'turmas'
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

      <div className="flex-1">
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