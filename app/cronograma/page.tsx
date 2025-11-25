'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, CustomSelect } from '@/app/components';
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
} from '@/app/utils/auth';
import { getSidebarItems } from '@/app/utils/sidebarItems';
import { fetchCronogramas, Cronograma, TIPO_EVENTO } from '@/app/utils/cronogramas';

export default function CronogramaPage() {
  const router = useRouter();
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [mesFiltro, setMesFiltro] = useState<string>('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('cronograma');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<ReturnType<typeof getSidebarItems>>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const user = getAuthUser();
    setUserData(user);
    if (user?.roles?.[0]) {
      setSidebarItems(getSidebarItems(user.roles[0]));
    }
    carregarCronogramas();
  }, [router]);

  const carregarCronogramas = async () => {
    setIsLoading(true);
    const resultado = await fetchCronogramas();
    if (resultado.success && resultado.data) {
      setCronogramas(resultado.data);
    }
    setIsLoading(false);
  };

  const cronogramasFiltrados = cronogramas.filter((c) => {
    const matchTitulo = c.titulo.toLowerCase().includes(filtro.toLowerCase());
    const matchTipo = tipoFiltro === '' || c.tipoEvento === tipoFiltro;

    let matchMes = true;
    if (mesFiltro !== '') {
      const dataCronograma = new Date(c.data);
      const mesCronograma = dataCronograma.getUTCMonth() + 1;
      matchMes = mesCronograma === parseInt(mesFiltro);
    }
    
    return matchTitulo && matchTipo && matchMes && c.isAtivo;
  });

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const formatarTipoEvento = (tipo: TIPO_EVENTO) => {
    const tipos: Record<TIPO_EVENTO, string> = {
      [TIPO_EVENTO.REUNIAO]: 'Reunião',
      [TIPO_EVENTO.FERIADO]: 'Feriado',
      [TIPO_EVENTO.RECESSO]: 'Recesso',
      [TIPO_EVENTO.EVENTO_ESCOLAR]: 'Evento Escolar',
      [TIPO_EVENTO.ATIVIDADE_PEDAGOGICA]: 'Atividade Pedagógica',
      [TIPO_EVENTO.OUTRO]: 'Outro'
    };
    return tipos[tipo] || tipo;
  };

  const getCorTipo = (tipo: TIPO_EVENTO) => {
    const cores: Record<TIPO_EVENTO, string> = {
      [TIPO_EVENTO.REUNIAO]: 'bg-blue-100 text-blue-800',
      [TIPO_EVENTO.FERIADO]: 'bg-red-100 text-red-800',
      [TIPO_EVENTO.RECESSO]: 'bg-yellow-100 text-yellow-800',
      [TIPO_EVENTO.EVENTO_ESCOLAR]: 'bg-green-100 text-green-800',
      [TIPO_EVENTO.ATIVIDADE_PEDAGOGICA]: 'bg-purple-100 text-purple-800',
      [TIPO_EVENTO.OUTRO]: 'bg-gray-100 text-gray-800'
    };
    return cores[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getNomeMes = (numeroMes: number): string => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[numeroMes - 1] || '';
  };

  const cronogramasPorMes = cronogramasFiltrados.reduce((acc, cronograma) => {
    const data = new Date(cronograma.data);
    const mes = data.getUTCMonth() + 1; // 1-12 (UTC)
    const ano = data.getUTCFullYear(); // UTC
    const chave = `${ano}-${mes}`;
    
    if (!acc[chave]) {
      acc[chave] = {
        mes,
        ano,
        cronogramas: []
      };
    }
    
    acc[chave].cronogramas.push(cronograma);
    return acc;
  }, {} as Record<string, { mes: number; ano: number; cronogramas: Cronograma[] }>);

  const gruposMesesOrdenados = Object.values(cronogramasPorMes).sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return a.mes - b.mes;
  });

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

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded"
              >
                ☰
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Cronograma Anual</h1>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Buscar por título..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <CustomSelect
                id="mesFiltro"
                name="mesFiltro"
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                options={[
                  { value: '', label: 'Todos os meses' },
                  { value: '1', label: 'Janeiro' },
                  { value: '2', label: 'Fevereiro' },
                  { value: '3', label: 'Março' },
                  { value: '4', label: 'Abril' },
                  { value: '5', label: 'Maio' },
                  { value: '6', label: 'Junho' },
                  { value: '7', label: 'Julho' },
                  { value: '8', label: 'Agosto' },
                  { value: '9', label: 'Setembro' },
                  { value: '10', label: 'Outubro' },
                  { value: '11', label: 'Novembro' },
                  { value: '12', label: 'Dezembro' }
                ]}
              />
              <CustomSelect
                id="tipoFiltro"
                name="tipoFiltro"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                options={[
                  { value: '', label: 'Todos os tipos' },
                  { value: TIPO_EVENTO.REUNIAO, label: 'Reunião' },
                  { value: TIPO_EVENTO.FERIADO, label: 'Feriado' },
                  { value: TIPO_EVENTO.RECESSO, label: 'Recesso' },
                  { value: TIPO_EVENTO.EVENTO_ESCOLAR, label: 'Evento Escolar' },
                  { value: TIPO_EVENTO.ATIVIDADE_PEDAGOGICA, label: 'Atividade Pedagógica' },
                  { value: TIPO_EVENTO.OUTRO, label: 'Outro' }
                ]}
              />
              
              {userData?.roles?.includes('ADMIN') && (
                <Link
                  href="/cronograma/cadastrar"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  + Novo Evento
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando cronogramas...</p>
            </div>
          ) : cronogramasFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg mb-4">
                {filtro || mesFiltro || tipoFiltro ? 'Nenhum evento encontrado' : 'Nenhum evento cadastrado'}
              </p>
              {userData?.roles?.includes('ADMIN') && !filtro && !mesFiltro && !tipoFiltro && (
                <Link
                  href="/cronograma/cadastrar"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Cadastrar Primeiro Evento
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {gruposMesesOrdenados.map((grupo) => (
                <div key={`${grupo.ano}-${grupo.mes}`} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Cabeçalho do mês */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">
                        {getNomeMes(grupo.mes)} {grupo.ano}
                      </h2>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {grupo.cronogramas.length} evento{grupo.cronogramas.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  
                  {/* Cards dos eventos do mês */}
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grupo.cronogramas.map((cronograma) => (
                        <div
                          key={cronograma.id}
                          className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-900 flex-1 pr-2">
                              {cronograma.titulo}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getCorTipo(cronograma.tipoEvento)}`}>
                              {formatarTipoEvento(cronograma.tipoEvento)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {cronograma.descricao}
                          </p>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatarData(cronograma.data)}
                          </div>
                          
                          {cronograma.criador && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">
                                <span className="font-medium">{cronograma.criador.nome}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
