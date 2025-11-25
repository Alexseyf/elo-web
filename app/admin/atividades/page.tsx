"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthUser,
  handleLogout,
  checkUserRole,
} from "../../utils/auth";
import { Sidebar, CustomSelect } from "../../components";
import {
  fetchAtividades,
  Atividade,
} from "../../utils/atividades";
import { getAdminSidebarItems } from "../../utils/sidebarItems";
import { fetchTurmas, Turma, formatarNomeTurma } from "../../utils/turmas";
import { formatarCampoExperiencia } from "../../utils/campos";

export default function AdminAtividades() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [filtroTurma, setFiltroTurma] = useState<number | string>("");
  const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear());
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("");

  const sidebarItems = getAdminSidebarItems();

  useEffect(() => {
    if (checkUserRole(router, "ADMIN")) {
      setUserData(getAuthUser());
      loadTurmas();
      loadAtividades();
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

  const loadAtividades = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAtividades();

      if (result.success && result.data) {
        setAtividades(result.data);
      } else {
        setError(result.error || "Erro ao carregar atividades");
      }
    } catch (err) {
      setError("Erro inesperado ao carregar atividades");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    handleLogout();
  };

  const getAtividadesFiltradas = () => {
    return atividades.filter((atividade) => {
      const turmaMatch = !filtroTurma || String(atividade.turmaId) === filtroTurma;
      const anoMatch = !filtroAno || atividade.ano === filtroAno;
      const periodoMatch = !filtroPeriodo || atividade.periodo === filtroPeriodo;
      
      return turmaMatch && anoMatch && periodoMatch;
    });
  };

  const formatarData = (data: string) => {
    // Exibe a data sem conversão de fuso, formato DD/MM/YYYY
    return data.slice(8, 10) + "/" + data.slice(5, 7) + "/" + data.slice(0, 4);
  };

  const atividadesFiltradas = getAtividadesFiltradas();

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
        activeSection="atividades"
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
              Atividades Pedagógicas
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Gerencie as atividades cadastradas no sistema
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  Ano
                </label>
                <CustomSelect
                  id="filtroAno"
                  name="filtroAno"
                  value={filtroAno}
                  onChange={(e) => setFiltroAno(Number(e.target.value))}
                  options={[
                    { value: new Date().getFullYear(), label: new Date().getFullYear().toString() },
                    ...Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i - 1;
                      return { value: year, label: year.toString() };
                    }),
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <CustomSelect
                  id="filtroPeriodo"
                  name="filtroPeriodo"
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                  options={[
                    { value: "", label: "Todos os períodos" },
                    { value: "PRIMEIRO_SEMESTRE", label: "1º Semestre" },
                    { value: "SEGUNDO_SEMESTRE", label: "2º Semestre" },
                  ]}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFiltroTurma("");
                    setFiltroAno(new Date().getFullYear());
                    setFiltroPeriodo("");
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
                onClick={loadAtividades}
                className="mt-2 text-sm underline hover:text-red-800"
              >
                Tentar novamente
              </button>
            </div>
          ) : atividadesFiltradas.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">
                {atividades.length === 0
                  ? "Nenhuma atividade cadastrada"
                  : "Nenhuma atividade corresponde aos filtros selecionados"}
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
                      Campo
                    </th>
                    <th
                      scope="col"
                      className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Turma
                    </th>
                    <th
                      scope="col"
                      className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Data
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Horas
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
                  {atividadesFiltradas.map((atividade) => (
                    <tr key={atividade.id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                        <span className="inline-block max-w-xs text-xs">
                          {formatarCampoExperiencia(atividade.campoExperiencia)}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {atividade.turma?.nome ? formatarNomeTurma(atividade.turma.nome) : "-"}
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatarData(atividade.data)}
                      </td>
                      <td className="hidden md:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {atividade.quantHora}h
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-xs"
                          onClick={() =>
                            router.push(`/admin/atividades/${atividade.id}`)
                          }
                        >
                          Detalhar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumo */}
          {atividadesFiltradas.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <p>
                Exibindo <strong>{atividadesFiltradas.length}</strong> de{" "}
                <strong>{atividades.length}</strong> atividades
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
