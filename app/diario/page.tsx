'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar } from '@/app/components';
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
} from '@/app/utils/auth';
import { getSidebarItems } from '@/app/utils/sidebarItems';

interface DiarioCard {
  id: string;
  alunoNome: string;
  data: string;
  disposicao: string;
  evacuacao: string;
  observacoes: string;
}

export default function DiarioPage() {
  const router = useRouter();
  const [diarios, setDiarios] = useState<DiarioCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('diarios');
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
    
    loadDiarios();
  }, [router]);

  const loadDiarios = async () => {
    try {
      setIsLoading(true);

      const mockDiarios: DiarioCard[] = [
        {
          id: '1',
          alunoNome: 'João Silva',
          data: '2024-11-12',
          disposicao: 'Alegre',
          evacuacao: 'Normal',
          observacoes: 'Criança bem disposta durante o dia',
        },
        {
          id: '2',
          alunoNome: 'Maria Santos',
          data: '2024-11-11',
          disposicao: 'Normal',
          evacuacao: 'Diarreia',
          observacoes: 'Apresentou diarreia após o almoço',
        },
      ];

      setDiarios(mockDiarios);
    } catch (error) {
      console.error('Erro ao carregar diários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const diariosFiltrados = diarios.filter((d) =>
    d.alunoNome.toLowerCase().includes(filtro.toLowerCase())
  );

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
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded"
                >
                  ☰
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Diários</h1>
              </div>
              <Link
                href="/diario/novo"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                + Novo Diário
              </Link>
            </div>

            <div className="mt-4">
              <input
                type="text"
                placeholder="Buscar por aluno..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Carregando diários...</p>
            </div>
          ) : diariosFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600 text-lg mb-4">
                {filtro ? 'Nenhum diário encontrado' : 'Nenhum diário registrado'}
              </p>
              <Link
                href="/diario/novo"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Criar Primeiro Diário
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diariosFiltrados.map((diario) => (
                <Link key={diario.id} href={`/diario/${diario.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6 h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">{diario.alunoNome}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(diario.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Disposição:</span>
                        <span className="font-medium">{diario.disposicao}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Evacuação:</span>
                        <span className="font-medium">{diario.evacuacao}</span>
                      </div>
                    </div>

                    {diario.observacoes && (
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 line-clamp-2 mb-4">
                        {diario.observacoes}
                      </div>
                    )}

                    <button className="w-full text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                      Ver detalhes →
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
