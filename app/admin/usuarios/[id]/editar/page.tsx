"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  isAuthenticated,
  getAuthUser,
  handleLogout,
  checkUserRole,
} from "../../../../utils/auth";
import { Sidebar } from "../../../../components";
import { getSidebarItems } from "../../../../utils/sidebarItems";

export default function EditarUsuario() {
  const router = useRouter();
  const params = useParams();
  const usuarioId = params.id as string;
  
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState("usuarios");

  const sidebarItems = getSidebarItems("ADMIN");

  useEffect(() => {
    if (checkUserRole(router, "ADMIN")) {
      setUserData(getAuthUser());
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
            <Link href={`/admin/usuarios/${usuarioId}`} className="hover:text-blue-600 underline">
              Detalhes
            </Link>
            <span>/</span>
            <span>Editar</span>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Editar Usuário
            </h1>
            <p className="text-gray-600 mb-8">
              Esta página será implementada em breve. 
              <br />
              Você pode editar as informações do usuário aqui.
            </p>
            <button
              onClick={() => router.back()}
              className="rounded bg-gray-600 hover:bg-gray-700 px-4 sm:px-6 py-2 sm:py-2.5 text-white font-semibold transition-colors text-sm sm:text-base"
            >
              Voltar
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
