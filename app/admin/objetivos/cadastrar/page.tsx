'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarHeader } from '../../../components';
import { getGrupos, Grupo } from '../../../utils/grupos';
import { getCamposExperiencia } from '../../../utils/campos';
import { checkUserRole, getAuthUser, handleLogout, getAuthToken } from '../../../utils/auth';

export default function CadastrarObjetivo() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [campos, setCampos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    grupoId: '',
    campoExperienciaId: ''
  });
  
  const [errors, setErrors] = useState({
    codigo: '',
    descricao: '',
    grupoId: '',
    campoExperienciaId: ''
  });

  useEffect(() => {
    if (checkUserRole(router, 'ADMIN')) {
      setUserData(getAuthUser());
      carregarDados();
    }
  }, [router]);

  const carregarDados = async () => {
    try {
      const gruposData = await getGrupos();
      setGrupos(gruposData);

      const camposResult = await getCamposExperiencia();
      if (camposResult.success && camposResult.data) {
        setCampos(camposResult.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMensagem({
        texto: 'Erro ao carregar dados necessários',
        tipo: 'erro'
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      codigo: '',
      descricao: '',
      grupoId: '',
      campoExperienciaId: ''
    };
    
    if (!formData.codigo) {
      newErrors.codigo = 'Informe o código';
      isValid = false;
    }
    if (!formData.descricao) {
      newErrors.descricao = 'Informe a descrição';
      isValid = false;
    }
    if (!formData.grupoId) {
      newErrors.grupoId = 'Selecione o grupo';
      isValid = false;
    }
    if (!formData.campoExperienciaId) {
      newErrors.campoExperienciaId = 'Selecione o campo de experiência';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMensagem(null);
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/objetivos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo: formData.codigo,
          descricao: formData.descricao,
          grupoId: Number(formData.grupoId),
          campoExperienciaId: Number(formData.campoExperienciaId)
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.erro || result.details || 'Erro ao cadastrar objetivo');
      }
      
      setMensagem({
        texto: 'Objetivo cadastrado com sucesso!',
        tipo: 'sucesso'
      });
      
      setFormData({
        codigo: '',
        descricao: '',
        grupoId: '',
        campoExperienciaId: ''
      });
    } catch (error: any) {
      setMensagem({
        texto: error.message || 'Erro ao cadastrar objetivo',
        tipo: 'erro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCancel = () => {
    router.push('/admin/dashboard?section=atividades');
  };

  const onLogout = () => {
    handleLogout();
  };

  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

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
                    } else if (item.id === 'atividades') {
                      setMobileMenuOpen(false);
                    } else {
                      router.push(`/admin/dashboard?section=${item.id}`);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`block rounded-md px-4 py-2 text-sm transition-colors ${
                    item.id === 'atividades'
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Cadastrar Novo Objetivo</h1>
            <p className="text-sm text-gray-600 mt-1">Preencha os campos abaixo para cadastrar um novo objetivo no sistema</p>
          </div>

          {mensagem && (
            <div className={`p-4 mb-6 rounded-md ${
              mensagem.tipo === 'sucesso' ? 'bg-green-50 text-green-700 border border-green-200' : 
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <p>{mensagem.texto}</p>
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
                    Código*
                  </label>
                  <input
                    type="text"
                    id="codigo"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.codigo ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="Digite o código"
                  />
                  {errors.codigo && <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>}
                </div>

                <div>
                  <label htmlFor="grupoId" className="block text-sm font-medium text-gray-700 mb-1">
                    Grupo*
                  </label>
                  <select
                    id="grupoId"
                    name="grupoId"
                    value={formData.grupoId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.grupoId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  >
                    <option value="">Selecione o grupo</option>
                    {grupos.map((grupo) => (
                      <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                    ))}
                  </select>
                  {errors.grupoId && <p className="mt-1 text-sm text-red-600">{errors.grupoId}</p>}
                </div>

                <div>
                  <label htmlFor="campoExperienciaId" className="block text-sm font-medium text-gray-700 mb-1">
                    Campo de Experiência*
                  </label>
                  <select
                    id="campoExperienciaId"
                    name="campoExperienciaId"
                    value={formData.campoExperienciaId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.campoExperienciaId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  >
                    <option value="">Selecione o campo</option>
                    {campos.map((campo: any) => (
                      <option key={campo.id} value={campo.id}>{campo.campoExperiencia || campo.nome}</option>
                    ))}
                  </select>
                  {errors.campoExperienciaId && <p className="mt-1 text-sm text-red-600">{errors.campoExperienciaId}</p>}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição*
                  </label>
                  <input
                    type="text"
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.descricao ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="Digite a descrição"
                  />
                  {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Cadastrando...</span>
                    </div>
                  ) : (
                    'Cadastrar Objetivo'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
