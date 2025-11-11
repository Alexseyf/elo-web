"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
  checkUserRole,
} from "../../utils/auth";
import { Sidebar } from "../../components";

export default function ProfessorDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("visao-geral");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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

  useEffect(() => {
    if (checkUserRole(router, "PROFESSOR")) {
      setUserData(getAuthUser());

      const urlParams = new URLSearchParams(window.location.search);
      const sectionParam = urlParams.get("section");
      if (
        sectionParam &&
        sidebarItems.some((item) => item.id === sectionParam)
      ) {
        setActiveSection(sectionParam);
      }
    }
  }, [router]);

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
        activeSection={activeSection}
        setActiveSection={setActiveSection}
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
          <section
            id="visao-geral"
            className={activeSection === "visao-geral" ? "block" : "hidden"}
          >
            <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold">
              Visão Geral
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-white p-4 md:p-6 shadow">
                <h3 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">
                  Bem-vindo ao Dashboard
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Aqui você pode gerenciar suas turmas e alunos.
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 md:p-6 shadow">
                <h3 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">
                  Atividades Recentes
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Visualize as últimas atividades de suas turmas.
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 md:p-6 shadow">
                <h3 className="mb-3 md:mb-4 text-base md:text-lg font-semibold">
                  Estatísticas
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Resumo dos dados de suas turmas e alunos.
                </p>
              </div>
            </div>
          </section>

          <section
            id="minhas-turmas"
            className={activeSection === "minhas-turmas" ? "block" : "hidden"}
          >
            <h2 className="mb-6 text-lg md:text-xl font-semibold">
              Minhas Turmas
            </h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium mb-4">Turmas Atribuídas</h3>
              <p className="mb-4 text-gray-600">
                Visualize e gerencie todas as suas turmas.
              </p>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={() => {
                  /* Implementar navegação para turmas */
                }}
              >
                Acessar Turmas
              </button>
            </div>
          </section>

          <section
            id="atividades"
            className={activeSection === "atividades" ? "block" : "hidden"}
          >
            <h2 className="mb-6 text-lg md:text-xl font-semibold">
              Avaliações
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium mb-4">
                  Atividades Pedagógicas
                </h3>
                <p className="mb-4 text-gray-600">
                  Registre atividades realizadas em sala.
                </p>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={() => {
                    router.push('/professor/atividades/cadastrar');
                  }}
                >
                  Registrar nova atividade
                </button>
              </div>
            </div>
          </section>

          <section
            id="alunos"
            className={activeSection === "alunos" ? "block" : "hidden"}
          >
            <h2 className="mb-6 text-lg md:text-xl font-semibold">
              Gerenciamento de Alunos
            </h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium mb-4">
                Alunos de Suas Turmas
              </h3>
              <p className="mb-4 text-gray-600">
                Visualize e gerencie todos os alunos das suas turmas.
              </p>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={() => {
                  /* Implementar listagem de alunos */
                }}
              >
                Ver Alunos
              </button>
            </div>
          </section>

          <section
            id="diarios"
            className={activeSection === "diarios" ? "block" : "hidden"}
          >
            <h2 className="mb-6 text-lg md:text-xl font-semibold">Diários</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium mb-4">Meus Diários</h3>
              <p className="mb-4 text-gray-600">
                Acompanhe e gerencie os diários de classe das suas turmas.
              </p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Visualizar Diários
              </button>
            </div>
          </section>

          <section
            id="calendario"
            className={activeSection === "calendario" ? "block" : "hidden"}
          >
            <h2 className="mb-6 text-lg md:text-xl font-semibold">
              Calendário
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium mb-4">Calendário Escolar</h3>
                <p className="mb-4 text-gray-600">
                  Visualize e gerencie o calendário escolar das suas turmas.
                </p>
                <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  Adicionar Evento
                </button>
              </div>
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium mb-4">Eventos da turma</h3>
                <p className="mb-4 text-gray-600">
                  Visualize e gerencie eventos da turma (Reuniões, passeios...).
                </p>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={() => {
                    /* Implementar gerenciamento de eventos */
                  }}
                >
                  Gerenciar eventos
                </button>
              </div>
            </div>
          </section>

          <section
            id="cronograma"
            className={activeSection === "cronograma" ? "block" : "hidden"}
          >
            <h2 className="mb-6 text-lg md:text-xl font-semibold">
              Cronograma
            </h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium mb-4">Cronograma Anual</h3>
              <p className="mb-4 text-gray-600">
                Configure e acompanhe o cronograma anual de atividades.
              </p>
              <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                Visualizar Cronograma
              </button>
            </div>
          </section>

          <section
            id="relatorios"
            className={activeSection === "relatorios" ? "block" : "hidden"}
          >
            <h2 className="mb-6 text-lg md:text-xl font-semibold">
              Relatórios
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium mb-4">Parecer Descritivo</h3>
                <p className="mb-4 text-gray-600">
                  Pareceres descritivos dos alunos.
                </p>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={() => {
                    /* Implementar gerenciamento de pareceres */
                  }}
                >
                  Gerenciar pareceres
                </button>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium mb-4">Frequência</h3>
                <p className="mb-4 text-gray-600">
                  Relatório de frequência das turmas.
                </p>
                <button
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  onClick={() => {
                    /* Implementar gerenciamento de frequência */
                  }}
                >
                  Gerenciar frequência
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
