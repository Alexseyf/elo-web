"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getTurmasProfessor,
  TurmaProfessor,
  GetTurmasProfessorResult,
} from "../../utils/professores";
import { getAuthUser, handleLogout, checkUserRole } from "../../utils/auth";
import { formatarNomeTurma } from "../../utils/turmas";
import { Sidebar } from "../../components";

export default function AlunosProfessorPage() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<TurmaProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [professorId, setProfessorId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTurma, setSelectedTurma] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (checkUserRole(router, "PROFESSOR")) {
      const user = getAuthUser();
      setUserData(user);

      const fetchTurmasAlunos = async () => {
        try {
          setLoading(true);

          if (!user || !user.id) {
            throw new Error("Usuário não autenticado. Faça login novamente.");
          }

          const id = parseInt(user.id);

          if (!id || id <= 0) {
            throw new Error("ID de professor inválido. Faça login novamente.");
          }

          setProfessorId(id);

          const resultado: GetTurmasProfessorResult = await getTurmasProfessor(
            id
          );

          if (!resultado.success) {
            throw new Error(
              resultado.message ||
                "Não foi possível carregar as turmas. Verifique se você está cadastrado como professor em alguma turma."
            );
          }

          const turmasData = resultado.data || [];
          setTurmas(turmasData);
        } catch (err: any) {
          setError(err.message || "Erro ao carregar alunos");
        } finally {
          setLoading(false);
        }
      };

      fetchTurmasAlunos();
    }
  }, [router]);

  const onLogout = () => {
    handleLogout();
  };

  const formatarData = (data: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const turmasFiltradas = turmas
    .map((turma) => {
      if (selectedTurma && turma.id !== selectedTurma) {
        return { ...turma, alunos: [] };
      }

      const alunosFiltrados = turma.alunos.filter(
        (aluno) =>
          aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (aluno.responsavel &&
            aluno.responsavel.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return {
        ...turma,
        alunos: alunosFiltrados,
        totalAlunos: alunosFiltrados.length,
      };
    })
    .filter((turma) => !selectedTurma || turma.id === selectedTurma);

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 relative">
        <Sidebar
          items={sidebarItems}
          activeSection="alunos"
          setActiveSection={(id) => {
            if (id === "visao-geral") {
              router.push("/professor/dashboard");
            } else {
              router.push(`/professor/dashboard?section=${id}`);
            }
          }}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          userData={userData}
          onLogout={onLogout}
        />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 relative">
        <Sidebar
          items={sidebarItems}
          activeSection="alunos"
          setActiveSection={(id) => {
            if (id === "visao-geral") {
              router.push("/professor/dashboard");
            } else {
              router.push(`/professor/dashboard?section=${id}`);
            }
          }}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          userData={userData}
          onLogout={onLogout}
        />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      <Sidebar
        items={sidebarItems}
        activeSection="alunos"
        setActiveSection={(id) => {
          if (id === "visao-geral") {
            router.push("/professor/dashboard");
          } else {
            router.push(`/professor/dashboard?section=${id}`);
          }
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userData={userData}
        onLogout={onLogout}
      />

      {/* Conteúdo principal */}
      <div className="flex-1">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          {/* Botão do menu em dispositivos móveis */}
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
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Meus Alunos
              </h1>
              <p className="text-gray-600 mb-4">
                Lista de alunos das turmas em que você está cadastrado
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por nome do aluno ou responsável..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="sm:w-48">
                  <select
                    value={selectedTurma || ""}
                    onChange={(e) =>
                      setSelectedTurma(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as turmas</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {formatarNomeTurma(turma.nome)}
                      </option>
                    ))}
                  </select>
                </div>

                {(searchTerm || selectedTurma) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedTurma(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>

            {turmasFiltradas.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-24 w-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma turma encontrada
                </h3>
                <p className="text-gray-500">
                  Você não está cadastrado em nenhuma turma ou não há alunos
                  cadastrados.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {turmasFiltradas.map((turma) => (
                  <div
                    key={turma.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="bg-blue-50 px-6 py-4 border-b">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            {formatarNomeTurma(turma.nome)}
                          </h2>
                          {turma.grupo && (
                            <p className="text-sm text-gray-600 mt-1">
                              Grupo: {turma.grupo}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {turma.totalAlunos} aluno
                            {turma.totalAlunos !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {turma.alunos && turma.alunos.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nome
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data de Nascimento
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {turma.alunos.map((aluno) => (
                              <tr key={aluno.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                        <span className="text-sm font-medium text-white">
                                          {aluno.nome.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {aluno.nome}
                                      </div>
                                      {aluno.email && (
                                        <div className="text-sm text-gray-500">
                                          {aluno.email}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatarData(aluno.dataNascimento || "")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      aluno.ativo !== false
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {aluno.ativo !== false
                                      ? "Ativo"
                                      : "Inativo"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">
                          Nenhum aluno cadastrado nesta turma.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
