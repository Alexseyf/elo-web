"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthUser,
  handleLogout,
  checkUserRole,
} from "../../../utils/auth";
import { Sidebar, CustomSelect } from "../../../components";
import { getAlunos, Aluno } from "../../../utils/alunos";
import { getAdminSidebarItems } from "../../../utils/sidebarItems";
import { fetchTurmas, Turma, formatarNomeTurma } from "../../../utils/turmas";

export default function ListarAlunos() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [filtroTurma, setFiltroTurma] = useState<number | string>("");
  const [buscaNome, setBuscaNome] = useState<string>("");

  const sidebarItems = getAdminSidebarItems();

  useEffect(() => {
    if (checkUserRole(router, "ADMIN")) {
      setUserData(getAuthUser());
      loadTurmas();
      loadAlunos();
    }
  }, [router]);

  const loadTurmas = async () => {
    try {
      const result = await fetchTurmas();
      if (result.success && result.data) {
        setTurmas(result.data);
      }
    } catch (err) {
      console.error("Erro ao carregar turmas:", err);
    }
  };

  const loadAlunos = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAlunos();
      setAlunos(data);
    } catch (err) {
      setError("Erro inesperado ao carregar alunos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    handleLogout();
  };

  const getAlunosFiltrados = () => {
    return alunos.filter((aluno) => {
      const turmaMatch = !filtroTurma || String(aluno.turma?.id) === String(filtroTurma);
      const nomeMatch = !buscaNome || 
        aluno.nome.toLowerCase().includes(buscaNome.toLowerCase());
      
      return turmaMatch && nomeMatch;
    });
  };

  const alunosFiltrados = getAlunosFiltrados();

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar
        items={sidebarItems}
        activeSection="alunos"
        setActiveSection={(section) => {
          router.push(`/admin/dashboard?section=${section}`);
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userData={userData}
        onLogout={onLogout}
      />

      {/* Conteúdo principal */}
      <div className="flex-1">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:hidden">
          <button
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </header>

        <main className="p-4 md:pt-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Alunos
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Visualize e gerencie os alunos cadastrados no sistema
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turma
                </label>
                <CustomSelect
                  id="filtroTurma"
                  name="filtroTurma"
                  value={filtroTurma}
                  onChange={(e) => setFiltroTurma(e.target.value)}
                  options={[
                    { value: "", label: "Todas as turmas" },
                    ...turmas.map((turma) => ({
                      value: turma.id,
                      label: turma.nome,
                    })),
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar por nome
                </label>
                <input
                  type="text"
                  id="buscaNome"
                  name="buscaNome"
                  value={buscaNome}
                  onChange={(e) => setBuscaNome(e.target.value)}
                  placeholder="Digite o nome do aluno..."
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFiltroTurma("");
                    setBuscaNome("");
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
              <button
                onClick={loadAlunos}
                className="mt-2 text-sm underline hover:text-red-800"
              >
                Tentar novamente
              </button>
            </div>
          ) : alunosFiltrados.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">
                {alunos.length === 0
                  ? "Nenhum aluno cadastrado"
                  : "Nenhum aluno corresponde aos filtros selecionados"}
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Matrícula
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Turma
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alunosFiltrados.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {aluno.nome}
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {aluno.matricula}
                      </td>
                      <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {aluno.turma?.nome ? formatarNomeTurma(aluno.turma.nome) : "-"}
                      </td>
                      <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {aluno.email || "-"}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-sm font-bold transition-colors duration-200 md:px-3 md:py-1.5 md:text-xs"
                          onClick={() =>
                            router.push(`/admin/alunos/${aluno.id}`)
                          }
                          title="Ver detalhes"
                        >
                          <span className="md:hidden">Detelhes</span>
                          <span className="hidden md:inline">Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumo */}
          {alunosFiltrados.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Exibindo <strong>{alunosFiltrados.length}</strong> de{" "}
                <strong>{alunos.length}</strong> alunos
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
