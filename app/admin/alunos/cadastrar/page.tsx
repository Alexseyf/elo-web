'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarHeader } from '../../../components';
import { checkUserRole, getAuthUser, handleLogout } from '../../../utils/auth';
import { getTurmas } from '../../../utils/turmas';

interface Turma {
  id: number;
  nome: string;
}

export default function CadastrarAluno() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    dataNasc: '',
    turmaId: 0,
    mensalidade: ''
  });
  
  const [errors, setErrors] = useState({
    nome: '',
    dataNasc: '',
    turmaId: '',
    mensalidade: ''
  });

  useEffect(() => {
    if (checkUserRole(router, 'ADMIN')) {
      setUserData(getAuthUser());
      carregarTurmas();
    }
  }, [router]);

  const carregarTurmas = async () => {
    try {
      const listaTurmas = await getTurmas();
      setTurmas(listaTurmas);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      setMensagem({
        texto: 'Erro ao carregar lista de turmas',
        tipo: 'erro'
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      nome: '',
      dataNasc: '',
      turmaId: '',
      mensalidade: ''
    };
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      isValid = false;
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
      isValid = false;
    } else if (formData.nome.trim().length > 60) {
      newErrors.nome = 'Nome deve ter no máximo 60 caracteres';
      isValid = false;
    }
    
    if (!formData.dataNasc) {
      newErrors.dataNasc = 'Data de nascimento é obrigatória';
      isValid = false;
    } else {
      const dataNasc = new Date(formData.dataNasc);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataNasc > hoje) {
        newErrors.dataNasc = 'Data de nascimento não pode ser uma data futura';
        isValid = false;
      }
    }
    
    if (!formData.turmaId || parseInt(formData.turmaId as unknown as string, 10) <= 0) {
      newErrors.turmaId = 'Turma é obrigatória';
      isValid = false;
    }
    
    if (formData.mensalidade) {
      const valorLimpo = formData.mensalidade.replace(/\./g, '').replace(',', '.');
      const valorNumerico = parseFloat(valorLimpo);
      
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        newErrors.mensalidade = 'Mensalidade deve ser um valor positivo';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly === '') {
      setFormData({ ...formData, [name]: '' });
      return;
    }

    const numValue = parseInt(digitsOnly, 10) / 100;
    const formatter = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    const formattedValue = formatter.format(numValue);
    
    setFormData({ ...formData, [name]: formattedValue });
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
      
      let mensalidadeNumerica = undefined;
      if (formData.mensalidade) {
        const valorLimpo = formData.mensalidade.replace(/\./g, '').replace(',', '.');
        mensalidadeNumerica = parseFloat(valorLimpo);
      }
      
      const dataNascimento = new Date(formData.dataNasc);
      const dataFormatada = new Date(
        dataNascimento.getFullYear(),
        dataNascimento.getMonth(),
        dataNascimento.getDate()
      ).toISOString();

      const turmaIdNumerico = parseInt(formData.turmaId as unknown as string, 10);
      if (isNaN(turmaIdNumerico)) {
        throw new Error('ID da turma inválido');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          nome: formData.nome.trim(),
          dataNasc: dataFormatada,
          turmaId: turmaIdNumerico,
          isAtivo: true,
          mensalidade: mensalidadeNumerica
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao cadastrar aluno');
      }
      
      setMensagem({
        texto: 'Aluno cadastrado com sucesso!',
        tipo: 'sucesso'
      });
      
      setFormData({
        nome: '',
        dataNasc: '',
        turmaId: 0,
        mensalidade: ''
      });
      
    } catch (error: any) {
      setMensagem({
        texto: error.message || 'Erro ao cadastrar aluno',
        tipo: 'erro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/dashboard?section=alunos');
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
                    } else if (item.id === 'alunos') {
                      setMobileMenuOpen(false);
                    } else {
                      router.push(`/admin/dashboard?section=${item.id}`);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className={`block rounded-md px-4 py-2 text-sm transition-colors ${
                    item.id === 'alunos'
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
            <h1 className="text-2xl font-bold text-gray-800">Cadastrar Novo Aluno</h1>
            <p className="text-sm text-gray-600 mt-1">Preencha os campos abaixo para cadastrar um novo aluno no sistema</p>
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
                  <label htmlFor="dataNasc" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento*
                  </label>
                  <input
                    type="date"
                    id="dataNasc"
                    name="dataNasc"
                    value={formData.dataNasc}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.dataNasc ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {errors.dataNasc && <p className="mt-1 text-sm text-red-600">{errors.dataNasc}</p>}
                </div>

                <div>
                  <label htmlFor="turmaId" className="block text-sm font-medium text-gray-700 mb-1">
                    Turma*
                  </label>
                  <select
                    id="turmaId"
                    name="turmaId"
                    value={formData.turmaId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.turmaId ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  >
                    <option value={0}>Selecione uma turma</option>
                    {turmas.map(turma => (
                      <option key={turma.id} value={turma.id}>{turma.nome}</option>
                    ))}
                  </select>
                  {errors.turmaId && <p className="mt-1 text-sm text-red-600">{errors.turmaId}</p>}
                </div>

                <div>
                  <label htmlFor="mensalidade" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensalidade (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="text"
                      id="mensalidade"
                      name="mensalidade"
                      value={formData.mensalidade}
                      onChange={handleNumberChange}
                      className={`w-full pl-10 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                        ${errors.mensalidade ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                      placeholder="0,00"
                    />
                  </div>
                  {errors.mensalidade && <p className="mt-1 text-sm text-red-600">{errors.mensalidade}</p>}
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
                    'Cadastrar Aluno'
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
