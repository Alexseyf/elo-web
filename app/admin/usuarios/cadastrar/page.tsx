'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SidebarHeader } from '../../../components';
import { checkUserRole, getAuthUser, handleLogout } from '../../../utils/auth';

enum TIPO_USUARIO {
  ADMIN = 'ADMIN',
  PROFESSOR = 'PROFESSOR',
  RESPONSAVEL = 'RESPONSAVEL'
}

export default function CadastrarUsuario() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [activeSection, setActiveSection] = useState('usuarios');
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    roles: [] as TIPO_USUARIO[]
  });
  
  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    telefone: '',
    roles: ''
  });

  useEffect(() => {
    if (checkUserRole(router, 'ADMIN')) {
      setUserData(getAuthUser());
    }
  }, [router]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      nome: '',
      email: '',
      telefone: '',
      roles: ''
    };
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
      isValid = false;
    }
    
    if (formData.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Telefone deve estar no formato (XX) XXXX-XXXX ou (XX) XXXXX-XXXX';
      isValid = false;
    }
    
    if (formData.roles.length === 0) {
      newErrors.roles = 'Selecione pelo menos um tipo de usuário';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      value = `(${value.slice(0, 2)})${value.slice(2)}`;
      
      if (value.length > 4) {
        value = `${value.slice(0, 4)} ${value.slice(4)}`;
      }
      
      if (value.length > 10) {
        value = `${value.slice(0, 10)}-${value.slice(10, 14)}`;
      } else if (value.length > 9) {
        value = `${value.slice(0, 9)}-${value.slice(9, 13)}`;
      }
    }
    
    setFormData({ ...formData, telefone: value });
  };

  const handleRoleToggle = (role: TIPO_USUARIO) => {
    if (formData.roles.includes(role)) {
      setFormData({
        ...formData,
        roles: formData.roles.filter(r => r !== role)
      });
    } else {
      setFormData({
        ...formData,
        roles: [...formData.roles, role]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMensagem(null);
    
    try {
      const authToken = localStorage.getItem('@auth_token');
      if (!authToken) {
        throw new Error('Token não encontrado');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || undefined,
          roles: formData.roles
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao cadastrar usuário');
      }
      
      setMensagem({
        texto: data.mensagem || 'Usuário cadastrado com sucesso!',
        tipo: 'sucesso'
      });
      
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        roles: []
      });
      
    } catch (error: any) {
      setMensagem({
        texto: error.message || 'Erro ao cadastrar usuário',
        tipo: 'erro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/dashboard?section=usuarios');
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
                    } else if (item.id === 'usuarios') {
                      setMobileMenuOpen(false);
                    } else {
                      router.push(`/admin/dashboard?section=${item.id}`);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`block rounded-md px-4 py-2 text-sm transition-colors ${
                    item.id === 'usuarios'
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
      
      {/* Conteúdo principal */}
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
            <h1 className="text-2xl font-bold text-gray-800">Cadastrar Novo Usuário</h1>
            <p className="text-sm text-gray-600 mt-1">Preencha os campos abaixo para cadastrar um novo usuário no sistema</p>
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
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo*
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.nome ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="Digite o nome completo"
                  />
                  {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="Digite o email"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handlePhoneChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.telefone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="(XX) XXXXX-XXXX"
                  />
                  {errors.telefone && <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>}
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-500 mb-1">
                    Senha
                  </p>
                  <p className="text-xs text-gray-500">Uma senha temporária será gerada e enviada por email para o usuário</p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de usuário*
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="roleAdmin"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.roles.includes(TIPO_USUARIO.ADMIN)}
                        onChange={() => handleRoleToggle(TIPO_USUARIO.ADMIN)}
                      />
                      <label htmlFor="roleAdmin" className="ml-2 block text-sm text-gray-700">
                        Administrador
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="roleProfessor"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.roles.includes(TIPO_USUARIO.PROFESSOR)}
                        onChange={() => handleRoleToggle(TIPO_USUARIO.PROFESSOR)}
                      />
                      <label htmlFor="roleProfessor" className="ml-2 block text-sm text-gray-700">
                        Professor
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="roleResponsavel"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={formData.roles.includes(TIPO_USUARIO.RESPONSAVEL)}
                        onChange={() => handleRoleToggle(TIPO_USUARIO.RESPONSAVEL)}
                      />
                      <label htmlFor="roleResponsavel" className="ml-2 block text-sm text-gray-700">
                        Responsável
                      </label>
                    </div>
                  </div>
                  {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
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
                    'Cadastrar Usuário'
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
