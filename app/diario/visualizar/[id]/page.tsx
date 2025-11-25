'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Sidebar } from '@/app/components';
import { isAuthenticated, getAuthUser, handleLogout } from '@/app/utils/auth';
import { getSidebarItems } from '@/app/utils/sidebarItems';
import { getDiariosByAlunoId, Diario } from '@/app/utils/diarios';
import DiarioVisualizarSummary from '@/app/diario/components/DiarioVisualizarSummary';

export default function VisualizarDiarioPage() {
  const router = useRouter();
  const params = useParams();
  const alunoId = Number(params?.id);
  const [userData, setUserData] = useState<any>(null);
  const [sidebarItems, setSidebarItems] = useState<ReturnType<typeof getSidebarItems>>([]);
  const [diarios, setDiarios] = useState<Diario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    if (alunoId) {
      carregarDiarios();
    }
  }, [router, alunoId]);

  const carregarDiarios = async () => {
    setIsLoading(true);
    const listaDiarios = await getDiariosByAlunoId(alunoId);
    setDiarios(listaDiarios);
    setIsLoading(false);
  };

  const onLogout = () => {
    handleLogout();
    router.push('/login');
  };

  if (!userData) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={sidebarItems}
        activeSection="diarios"
        setActiveSection={() => {}}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userData={userData}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm sticky top-0 z-10 md:hidden">
          <div className="px-4 py-6 flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Diários do Aluno</h1>
          </div>
        </div>
        <main className="p-6 flex-1">
          {isLoading ? (
            <div className="text-center py-12">Carregando diário...</div>
          ) : diarios.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">Nenhum diário encontrado para este aluno.</div>
          ) : (
            <div className="space-y-6">
              {diarios.map((diario) => (
                <div key={diario.id} className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
                  <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className="font-semibold text-gray-700">Data:</span> {new Date(diario.data).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Aluno:</span> {diario.aluno?.nome}
                    </div>
                  </div>
                  <div className="my-4">
                    <DiarioVisualizarSummary diario={diario} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
