'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, CustomSelect } from '@/app/components';
import { 
  isAuthenticated, 
  getAuthUser, 
  handleLogout 
} from '@/app/utils/auth';
import { getSidebarItems } from '@/app/utils/sidebarItems';
import { 
  createCronograma, 
  TIPO_EVENTO, 
  CreateCronogramaData 
} from '@/app/utils/cronogramas';

export default function CadastrarCronograma() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [activeSection, setActiveSection] = useState('cronograma');
  const [sidebarItems, setSidebarItems] = useState<ReturnType<typeof getSidebarItems>>([]);
  
  const [formData, setFormData] = useState<CreateCronogramaData>({
    titulo: '',
    descricao: '',
    data: '',
    tipoEvento: TIPO_EVENTO.EVENTO_ESCOLAR,
    isAtivo: true,
    criadorId: 0
  });
  
  const [errors, setErrors] = useState({
    titulo: '',
    descricao: '',
    data: '',
    tipoEvento: '',
    criadorId: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = getAuthUser();
    setUserData(user);
    
    // Define o criadorId com o ID do usuário logado
    if (user?.id) {
      setFormData(prev => ({ ...prev, criadorId: user.id }));
    }
    
    if (user?.roles?.[0]) {
      setSidebarItems(getSidebarItems(user.roles[0]));
    }
  }, [router]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      titulo: '',
      descricao: '',
      data: '',
      tipoEvento: '',
      criadorId: ''
    };
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
      isValid = false;
    } else if (formData.titulo.length > 100) {
      newErrors.titulo = 'Título deve ter no máximo 100 caracteres';
      isValid = false;
    }
    
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
      isValid = false;
    } else if (formData.descricao.length > 500) {
      newErrors.descricao = 'Descrição deve ter no máximo 500 caracteres';
      isValid = false;
    }
    
    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
      isValid = false;
    }
    
    if (!formData.tipoEvento) {
      newErrors.tipoEvento = 'Tipo de evento é obrigatório';
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
      const resultado = await createCronograma(formData);
      
      if (!resultado.success) {
        throw new Error(resultado.message || 'Erro ao cadastrar cronograma');
      }
      
      setMensagem({
        texto: 'Cronograma cadastrado com sucesso!',
        tipo: 'sucesso'
      });

      setFormData({
        titulo: '',
        descricao: '',
        data: '',
        tipoEvento: TIPO_EVENTO.EVENTO_ESCOLAR,
        isAtivo: true,
        criadorId: userData?.id || 0
      });

      setTimeout(() => {
        router.push('/cronograma');
      }, 2000);
      
    } catch (error: any) {
      setMensagem({
        texto: error.message || 'Erro ao cadastrar cronograma',
        tipo: 'erro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

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
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                Cadastrar Evento no Cronograma
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Adicione um novo evento ao cronograma anual da escola
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 max-w-2xl">
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium leading-6 text-gray-900">
                  Título <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Ex: Reunião de Pais e Mestres"
                  />
                  {errors.titulo && (
                    <p className="mt-2 text-sm text-red-600">{errors.titulo}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.titulo.length}/100 caracteres
                  </p>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium leading-6 text-gray-900">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    maxLength={500}
                    rows={4}
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Descreva os detalhes do evento..."
                  />
                  {errors.descricao && (
                    <p className="mt-2 text-sm text-red-600">{errors.descricao}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.descricao.length}/500 caracteres
                  </p>
                </div>
              </div>

              {/* Data */}
              <div>
                <label htmlFor="data" className="block text-sm font-medium leading-6 text-gray-900">
                  Data <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                  {errors.data && (
                    <p className="mt-2 text-sm text-red-600">{errors.data}</p>
                  )}
                </div>
              </div>

              {/* Tipo de Evento */}
              <div>
                <label htmlFor="tipoEvento" className="block text-sm font-medium leading-6 text-gray-900">
                  Tipo de Evento <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <CustomSelect
                    id="tipoEvento"
                    name="tipoEvento"
                    value={formData.tipoEvento}
                    onChange={handleInputChange}
                    options={[
                      { value: TIPO_EVENTO.REUNIAO, label: 'Reunião' },
                      { value: TIPO_EVENTO.FERIADO, label: 'Feriado' },
                      { value: TIPO_EVENTO.RECESSO, label: 'Recesso' },
                      { value: TIPO_EVENTO.EVENTO_ESCOLAR, label: 'Evento Escolar' },
                      { value: TIPO_EVENTO.ATIVIDADE_PEDAGOGICA, label: 'Atividade Pedagógica' },
                      { value: TIPO_EVENTO.OUTRO, label: 'Outro' }
                    ]}
                  />
                  {errors.tipoEvento && (
                    <p className="mt-2 text-sm text-red-600">{errors.tipoEvento}</p>
                  )}
                </div>
              </div>



              {/* Mensagem de Sucesso/Erro */}
              {mensagem && (
                <div className={`rounded-md p-4 ${
                  mensagem.tipo === 'sucesso' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {mensagem.tipo === 'sucesso' ? (
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        mensagem.tipo === 'sucesso' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {mensagem.texto}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar Evento'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
