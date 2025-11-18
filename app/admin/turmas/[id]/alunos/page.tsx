"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { checkUserRole, getAuthUser, handleLogout } from "../../../../utils/auth";
import { getAlunosByTurma, Aluno } from "../../../../utils/alunos";
import { fetchTurmas, Turma } from "../../../../utils/turmas";
import { Sidebar } from "../../../../components";

export default function AlunosPorTurmaPage() {
  const router = useRouter();
  const params = useParams();
  const turmaId = params.id as string;
  
  const [userData, setUserData] = useState<any>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turma, setTurma] = useState<Turma | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTurma, setLoadingTurma] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const sidebarItems = [
    { id: "visao-geral", label: "Visão Geral", href: "/admin/dashboard?section=visao-geral" },
    { id: "usuarios", label: "Usuários", href: "/admin/dashboard?section=usuarios" },
    { id: "alunos", label: "Alunos", href: "/admin/dashboard?section=alunos" },
    { id: "turmas", label: "Turmas", href: "/admin/dashboard?section=turmas" },
    { id: "diarios", label: "Diários", href: "/admin/dashboard?section=diarios" },
    { id: "atividades", label: "Atividades Pedagógicas", href: "/admin/dashboard?section=atividades" },
    { id: "calendario", label: "Calendário", href: "/admin/dashboard?section=calendario" },
    { id: "cronograma", label: "Cronograma Anual", href: "/admin/dashboard?section=cronograma" },
  ];

  useEffect(() => {
    if (checkUserRole(router, "ADMIN")) {
      setUserData(getAuthUser());
      loadTurmaData();
      loadAlunos();
    }
  }, [router, turmaId]);

  const loadTurmaData = async () => {
    setLoadingTurma(true);
    try {
      const result = await fetchTurmas();
      if (result.success && result.data) {
        const turmaEncontrada = result.data.find(t => t.id === parseInt(turmaId));
        setTurma(turmaEncontrada || null);
      }
    } catch (err) {
      console.error("Erro ao carregar dados da turma:", err);
    } finally {
      setLoadingTurma(false);
    }
  };

  const loadAlunos = async () => {
    setLoading(true);
    setError(null);

    try {
      const alunosData = await getAlunosByTurma(parseInt(turmaId));
      setAlunos(alunosData);
    } catch (err) {
      setError("Erro ao carregar alunos da turma");
      console.error("Erro ao carregar alunos:", err);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    handleLogout();
  };

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
        activeSection="turmas"
        setActiveSection={() => {}}
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
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={() => router.push("/admin/dashboard?section=turmas")}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <svg
                    className="w-3 h-3 mr-2.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                  Turmas
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {loadingTurma ? "Carregando..." : turma ? turma.nome : "Turma"}
                  </span>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Alunos
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Cabeçalho */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {loadingTurma ? "Carregando turma..." : turma ? turma.nome : "Turma"}
            </h1>
          </div>

          {/* Conteúdo principal */}
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <button
                onClick={loadAlunos}
                className="mt-2 text-sm underline hover:text-red-800"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {alunos.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum aluno encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Esta turma ainda não possui alunos matriculados.
                  </p>
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/admin/alunos/cadastrar")}
                  >
                    Cadastrar aluno
                  </button>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        Lista de Alunos ({alunos.length})
                      </h2>
                      <button
                        className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                        onClick={() => router.push("/admin/alunos/cadastrar")}
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Adicionar Aluno
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Nome
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Matrícula
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {alunos.map((aluno) => (
                          <tr key={aluno.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {aluno.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {aluno.email || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {aluno.matricula || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="text-blue-600 hover:text-blue-900 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                                  onClick={() => {
                                    /* Implementar visualização de perfil do aluno */
                                  }}
                                >
                                  Ver Perfil
                                </button>
                                <button
                                  className="text-green-600 hover:text-green-900 text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded"
                                  onClick={() => router.push(`/diario/${aluno.id}`)}
                                >
                                  Diário
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
