'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/app/components';
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
} from '@/app/utils/auth';
import { getSidebarItems } from '@/app/utils/sidebarItems';
import DiarioStepper from '../components/DiarioStepper';
import type { DiarioFormData } from '@/app/lib/types/diario';

export default function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<DiarioFormData> | null>(null);
  const [diarioInfo, setDiarioInfo] = useState({ alunoNome: '', alunoId: '' });
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
    
    loadDiario();
  }, [resolvedParams.id, router]);

  const loadDiario = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Implementar chamada à API

      console.log('Carregando diário:', resolvedParams.id);
      const mockData: Partial<DiarioFormData> = {
        cafeDaManha: 'BOM',
        almoco: 'REGULAR',
        lancheDaTarde: 'OTIMO',
        leite: 'BOM',
        evacuacao: 'NORMAL',
        disposicao: 'AGITADO',
        sono: [],
        itensRequisitados: [],
        observacoes: '',
      };

      setInitialData(mockData);
      setDiarioInfo({ alunoNome: 'João Silva', alunoId: resolvedParams.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar diário';
      setError(message);
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: DiarioFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      // Implementar chamada à API
   

      console.log('Diário atualizado:', data);
      alert('Diário atualizado com sucesso!');
      router.push('/diario');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar diário';
      setError(message);
      console.error('Erro:', err);
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">Carregando diário...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-red-500 text-white p-8 rounded-lg shadow-lg max-w-md">
            <p className="text-2xl mb-4">Erro</p>
            <p className="mb-6">{error}</p>
            <button
              onClick={() => router.push('/diario')}
              className="bg-white text-red-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Voltar para Diários
            </button>
          </div>
        </div>
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
        {error && (
          <div className="bg-red-500 text-white px-6 py-3 shadow-lg">
            {error}
          </div>
        )}
        
        <div className="flex-1">
          {initialData && (
            <DiarioStepper
              onSubmit={handleSubmit}
              isLoading={isSaving}
              editMode={true}
              alunoNome={diarioInfo.alunoNome}
              initialData={initialData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
