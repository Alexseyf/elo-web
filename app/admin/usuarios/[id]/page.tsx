"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
  checkUserRole,
} from "../../../utils/auth";
import { fetchUsuarioDetalhes, Usuario } from "../../../utils/usuarios";
import { Sidebar, SidebarHeader } from "../../../components";
import { getSidebarItems } from "../../../utils/sidebarItems";

export default function DetalhesUsuario() {
  const router = useRouter();
  const params = useParams();
  const usuarioId = params.id as string;
  
  const [userData, setUserData] = useState<any>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState("usuarios");

  const sidebarItems = getSidebarItems("ADMIN");

  useEffect(() => {
    if (checkUserRole(router, "ADMIN")) {
      setUserData(getAuthUser());
      loadUsuarioDetalhes();
    }
  }, [router, usuarioId]);

  const loadUsuarioDetalhes = async () => {
    setLoading(true);
    setError(null);

    try {
      const id = parseInt(usuarioId, 10);
      if (isNaN(id)) {
        setError("ID de usuário inválido");
        setLoading(false);
        return;
      }

      const result = await fetchUsuarioDetalhes(id);

      if (result.success && result.data) {
        setUsuario(result.data);
      } else {
        setError(result.error || "Erro ao carregar detalhes do usuário");
      }
    } catch (err) {
      setError("Erro inesperado ao carregar detalhes do usuário");
      console.error(err);
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
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
            <Link href="/admin/dashboard?section=usuarios" className="hover:text-blue-600 underline">
              Usuários
            </Link>
            <span>/</span>
            <span>Detalhes</span>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <button
                onClick={loadUsuarioDetalhes}
                className="mt-2 text-sm underline hover:text-red-800"
              >
                Tentar novamente
              </button>
            </div>
          ) : usuario ? (
            <div className="space-y-6">
              {/* Cabeçalho com informações principais */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {usuario.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Informações principais */}
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {usuario.nome}
                    </h1>
                    <p className="text-gray-600 mb-3">{usuario.email}</p>
                    <div className="flex flex-wrap gap-2">
                      {usuario.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {translateRole(role)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <div className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                      usuario.isAtivo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`h-2 w-2 rounded-full mr-2 ${
                        usuario.isAtivo ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {usuario.isAtivo ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card de Informações */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Informações Gerais
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">ID</label>
                      <p className="text-gray-900 mt-1">{usuario.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900 mt-1">{usuario.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                      <p className="text-gray-900 mt-1">{usuario.nome}</p>
                    </div>
                  </div>
                </div>

                {/* Card de Status */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Status
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Ativo</label>
                      <p className="text-gray-900 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          usuario.isAtivo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.isAtivo ? 'Sim' : 'Não'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Primeiro Acesso</label>
                      <p className="text-gray-900 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          usuario.primeiroAcesso
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {usuario.primeiroAcesso ? 'Pendente' : 'Concluído'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card de Permissões */}
                <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Funções e Permissões
                  </h2>
                  <div className="space-y-3">
                    {usuario.roles.length > 0 ? (
                      usuario.roles.map((role) => (
                        <div
                          key={role}
                          className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-3"></div>
                          <span className="text-gray-900 font-medium">{translateRole(role)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">Nenhuma função atribuída</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.back()}
                  className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => router.push(`/admin/usuarios/${usuario.id}/editar`)}
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                >
                  Editar Usuário
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              <p>Usuário não encontrado</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function translateRole(role: string): string {
  const roleMap: { [key: string]: string } = {
    ADMIN: 'Administrador',
    PROFESSOR: 'Professor',
    RESPONSAVEL: 'Responsável',
  };
  return roleMap[role] || role;
}
