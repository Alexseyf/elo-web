"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getAuthUser,
  handleLogout,
  checkUserRole,
} from "../../../utils/auth";
import { fetchAtividadeDetalhes, Atividade } from "../../../utils/atividades";
import { Sidebar } from "../../../components";
import { getAdminSidebarItems } from "../../../utils/sidebarItems";
import { formatarCampoExperiencia } from "../../../utils/campos";
import { formatarNomeTurma } from "../../../utils/turmas";

export default function DetalhesAtividade() {
  const router = useRouter();
  const params = useParams();
  const atividadeId = params.id as string;

  const [userData, setUserData] = useState<any>(null);
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const sidebarItems = getAdminSidebarItems();

  useEffect(() => {
    if (checkUserRole(router, "ADMIN")) {
      setUserData(getAuthUser());
      loadAtividadeDetalhes();
    }
  }, [router, atividadeId]);

  const loadAtividadeDetalhes = async () => {
    setLoading(true);
    setError(null);

    try {
      const id = parseInt(atividadeId, 10);
      if (isNaN(id)) {
        setError("ID de atividade inválido");
        setLoading(false);
        return;
      }

      const result = await fetchAtividadeDetalhes(id);

      if (result.success && result.data) {
        setAtividade(result.data);
      } else {
        setError(result.error || "Erro ao carregar detalhes da atividade");
      }
    } catch (err) {
      setError("Erro inesperado ao carregar detalhes da atividade");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    handleLogout();
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarPeriodo = (periodo: string) => {
    const periodoMap: { [key: string]: string } = {
      PRIMEIRO_SEMESTRE: "1º Semestre",
      SEGUNDO_SEMESTRE: "2º Semestre",
    };
    return periodoMap[periodo] || periodo;
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
        activeSection="atividades"
        setActiveSection={() => {}}
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
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <button
                onClick={loadAtividadeDetalhes}
                className="mt-2 text-sm underline hover:text-red-800"
              >
                Tentar novamente
              </button>
            </div>
          ) : atividade ? (
            <div className="space-y-3 md:space-y-6">
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">

                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {formatarCampoExperiencia(atividade.campoExperiencia)}
                    </h1>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {atividade.ano}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {formatarPeriodo(atividade.periodo)}
                      </span>
                    </div>
                  </div>


                </div>
              </div>


              <div className="grid grid-cols-1 gap-3 md:gap-6">
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Data
                          </label>
                          <p className="text-gray-900 mt-1 text-base">
                            {formatarData(atividade.data)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Duração
                          </label>
                          <p className="text-gray-900 mt-1 text-base">
                            {atividade.quantHora} hora{atividade.quantHora !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-900 text-base">
                            {atividade.turma?.nome
                              ? formatarNomeTurma(atividade.turma.nome)
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {atividade.professor && (
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Professor
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-gray-900 mt-1 text-base">
                              {atividade.professor.nome}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-900 mt-1 text-base break-all">
                              {atividade.professor.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">

                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Campo de Experiência
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-900 text-base">
                        {formatarCampoExperiencia(atividade.campoExperiencia)}
                      </p>
                    </div>
                  </div>

                  {atividade.objetivo && (
                    <div className="mt-6">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Código
                          </label>
                          <p className="text-gray-900 mt-1 text-base">
                            {atividade.objetivo.codigo}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Descrição
                          </label>
                          <p className="text-gray-900 mt-1 text-sm">
                            {atividade.objetivo.descricao}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Descrição da Atividade
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {atividade.descricao}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => router.back()}
                  className="rounded bg-gray-600 hover:bg-gray-700 px-4 sm:px-6 py-2 sm:py-2.5 text-white font-semibold transition-colors text-sm sm:text-base"
                >
                  Voltar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              <p>Atividade não encontrada</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
