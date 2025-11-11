'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, CustomSelect } from '../../../components';
import { checkUserRole, getAuthUser, handleLogout } from '../../../utils/auth';
import { getTurmas, formatarNomeTurma, mapearTurmaParaGrupo, converterNomeParaEnum } from '../../../utils/turmas';
import { getObjetivosPorTurmaECampo } from '../../../utils/objetivos';
import { formatarCampoExperiencia } from '../../../utils/campos';
import { 
  createAtividade, 
  type CreateAtividadeData, 
  validateAtividadeData,
  SEMESTRE,
  CAMPO_EXPERIENCIA,
  getValidPeriodos
} from '../../../utils/atividades';

interface Turma {
  id: number;
  nome: string;
}

interface Objetivo {
  id: number;
  codigo: string;
  descricao: string;
}

export default function CadastrarAtividade() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<{texto: string, tipo: 'sucesso' | 'erro'} | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>('');
  
  const [formData, setFormData] = useState({
    ano: new Date().getFullYear().toString(),
    periodo: '',
    quantHora: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    turmaId: 0,
    campoExperiencia: '',
    objetivoId: 0,
    isAtivo: true
  });
  
  const [errors, setErrors] = useState({
    ano: '',
    periodo: '',
    quantHora: '',
    descricao: '',
    data: '',
    turmaId: '',
    campoExperiencia: '',
    objetivoId: '',
    isAtivo: ''
  });

  useEffect(() => {
    if (checkUserRole(router, 'PROFESSOR')) {
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
        texto: 'Erro ao carregar turmas',
        tipo: 'erro'
      });
    }
  };

  const carregarObjetivos = async (turmaId: number, campoExperiencia: string) => {
    if (!turmaId || !campoExperiencia) {
      setObjetivos([]);
      return;
    }

    try {
      const turma = turmas.find(t => t.id === turmaId);
      if (!turma) {
        setObjetivos([]);
        return;
      }

      const nomeTurmaEnum = converterNomeParaEnum(turma.nome);

      const grupo = mapearTurmaParaGrupo(nomeTurmaEnum || '');
      if (!grupo) {
        setObjetivos([]);
        return;
      }
      setGrupoSelecionado(grupo);

      const listaObjetivos = await getObjetivosPorTurmaECampo(nomeTurmaEnum || '', campoExperiencia as any);
      setObjetivos(listaObjetivos);

      if (formData.objetivoId) {
        setFormData(prev => ({ ...prev, objetivoId: 0 }));
      }
    } catch (error) {
      console.error('Erro ao carregar objetivos:', error);
      setMensagem({
        texto: 'Erro ao carregar objetivos',
        tipo: 'erro'
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'turmaId' || name === 'campoExperiencia') {
      const novoFormData = { ...formData, [name]: value };
      carregarObjetivos(Number(novoFormData.turmaId), novoFormData.campoExperiencia);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const digitsOnly = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataAtividade = new Date(formData.data);
      const agora = new Date();
      dataAtividade.setHours(agora.getHours(), agora.getMinutes(), agora.getSeconds());
      const dataFormatada = dataAtividade.toISOString();

      const atividadeData: CreateAtividadeData = {
        ano: Number(formData.ano),
        periodo: formData.periodo as SEMESTRE,
        quantHora: Number(formData.quantHora),
        descricao: formData.descricao.trim(),
        data: dataFormatada,
        turmaId: Number(formData.turmaId),
        campoExperiencia: formData.campoExperiencia as CAMPO_EXPERIENCIA,
        objetivoId: Number(formData.objetivoId),
        isAtivo: formData.isAtivo
      };

      const { isValid, errors: validationErrors } = validateAtividadeData(atividadeData);
      
      if (!isValid) {
        setErrors({
          ano: validationErrors.ano || '',
          periodo: validationErrors.periodo || '',
          quantHora: validationErrors.quantHora || '',
          descricao: validationErrors.descricao || '',
          data: validationErrors.data || '',
          turmaId: validationErrors.turmaId || '',
          campoExperiencia: validationErrors.campoExperiencia || '',
          objetivoId: validationErrors.objetivoId || '',
          isAtivo: validationErrors.isAtivo || ''
        });
        return;
      }

      setIsLoading(true);
      setMensagem(null);
      
      const result = await createAtividade(atividadeData);
      
      if (result.success) {
        setMensagem({
          texto: 'Atividade cadastrada com sucesso!',
          tipo: 'sucesso'
        });
        
        setFormData({
          ano: new Date().getFullYear().toString(),
          periodo: '',
          quantHora: '',
          descricao: '',
          data: new Date().toISOString().split('T')[0],
          turmaId: 0,
          campoExperiencia: '',
          objetivoId: 0,
          isAtivo: true
        });
        setErrors({
          ano: '',
          periodo: '',
          quantHora: '',
          descricao: '',
          data: '',
          turmaId: '',
          campoExperiencia: '',
          objetivoId: '',
          isAtivo: ''
        });

        setTimeout(() => {
          router.push('/professor/dashboard?section=atividades');
        }, 1500);
      } else {
        setMensagem({
          texto: result.message,
          tipo: 'erro'
        });
      }
    } catch (error: any) {
      setMensagem({
        texto: error.message || 'Erro ao cadastrar atividade',
        tipo: 'erro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/professor/dashboard?section=atividades');
  };

  const onLogout = () => {
    handleLogout();
  };

  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  const sidebarItems = [
    { id: "visao-geral", label: "Visão Geral", href: "#visao-geral" },
    { id: "minhas-turmas", label: "Minhas Turmas", href: "#minhas-turmas" },
    { id: "atividades", label: "Atividades", href: "#atividades" },
    { id: "alunos", label: "Alunos", href: "#alunos" },
    { id: "diarios", label: "Diários", href: "#diarios" },
    { id: "calendario", label: "Calendário", href: "#calendario" },
    { id: "cronograma", label: "Cronograma", href: "#cronograma" },
    { id: "relatorios", label: "Relatórios", href: "#relatorios" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar
        items={sidebarItems}
        activeSection="atividades"
        setActiveSection={(id) => {
          if (id === 'visao-geral') {
            router.push('/professor/dashboard');
          } else {
            router.push(`/professor/dashboard?section=${id}`);
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Cadastrar Nova Atividade</h1>
            <p className="text-sm text-gray-600 mt-1">Preencha os campos abaixo para cadastrar uma nova atividade pedagógica</p>
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 min-w-0">
                <div>
                  <label htmlFor="ano" className="block text-sm font-medium text-gray-700 mb-1">
                    Ano*
                  </label>
                  <input
                    type="number"
                    id="ano"
                    name="ano"
                    value={formData.ano}
                    onChange={handleNumberChange}
                    min="1900"
                    max="2100"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.ano ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="2025"
                  />
                  {errors.ano && <p className="mt-1 text-sm text-red-600">{errors.ano}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-1">
                    Período*
                  </label>
                  <CustomSelect
                    id="periodo"
                    name="periodo"
                    value={formData.periodo}
                    onChange={handleInputChange}
                    options={getValidPeriodos().map(periodo => ({
                      value: periodo,
                      label: periodo === SEMESTRE.PRIMEIRO_SEMESTRE ? '1º Semestre' : '2º Semestre'
                    }))}
                    error={!!errors.periodo}
                  />
                  {errors.periodo && <p className="mt-1 text-sm text-red-600">{errors.periodo}</p>}
                </div>
                <div>
                  <label htmlFor="quantHora" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade de Horas*
                  </label>
                  <input
                    type="number"
                    id="quantHora"
                    name="quantHora"
                    value={formData.quantHora}
                    onChange={handleNumberChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.quantHora ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="Horas"
                  />
                  {errors.quantHora && <p className="mt-1 text-sm text-red-600">{errors.quantHora}</p>}
                </div>
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                    Data*
                  </label>
                  <input
                    type="date"
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.data ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {errors.data && <p className="mt-1 text-sm text-red-600">{errors.data}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="turmaId" className="block text-sm font-medium text-gray-700 mb-1">
                    Turma*
                  </label>
                  <CustomSelect
                    id="turmaId"
                    name="turmaId"
                    value={formData.turmaId}
                    onChange={handleInputChange}
                    options={[
                      { value: 0, label: 'Selecione uma turma' },
                      ...turmas.map(turma => ({
                        value: turma.id,
                        label: formatarNomeTurma(turma.nome)
                      }))
                    ]}
                    error={!!errors.turmaId}
                  />
                  {errors.turmaId && <p className="mt-1 text-sm text-red-600">{errors.turmaId}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="campoExperiencia" className="block text-sm font-medium text-gray-700 mb-1">
                    Campo de Experiência*
                  </label>
                  <CustomSelect
                    id="campoExperiencia"
                    name="campoExperiencia"
                    value={formData.campoExperiencia}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Selecione um campo' },
                      ...Object.values(CAMPO_EXPERIENCIA).map(campo => ({
                        value: campo,
                        label: formatarCampoExperiencia(campo as any)
                      }))
                    ]}
                    error={!!errors.campoExperiencia}
                  />
                  {errors.campoExperiencia && <p className="mt-1 text-sm text-red-600">{errors.campoExperiencia}</p>}
                </div>
                <div className="min-w-0">
                  <label htmlFor="objetivoId" className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo*
                  </label>
                  <CustomSelect
                    id="objetivoId"
                    name="objetivoId"
                    value={formData.objetivoId}
                    onChange={handleInputChange}
                    options={[
                      { value: 0, label: 'Selecione um objetivo' },
                      ...objetivos.map(objetivo => ({
                        value: objetivo.id,
                        label: `${objetivo.codigo} - ${objetivo.descricao}`
                      }))
                    ]}
                    error={!!errors.objetivoId}
                  />
                  {errors.objetivoId && <p className="mt-1 text-sm text-red-600">{errors.objetivoId}</p>}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição*
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 
                      ${errors.descricao ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    placeholder="Descreva a atividade pedagógica (máximo 500 caracteres)"
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.descricao.length}/500 caracteres
                  </p>
                  {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>}
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Cadastrando...</span>
                    </div>
                  ) : (
                    'Cadastrar Atividade'
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
