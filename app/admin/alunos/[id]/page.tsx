"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getAuthUser,
  handleLogout,
  checkUserRole,
} from "../../../utils/auth";
import { Sidebar, CustomSelect } from "../../../components";
import { getAlunoDetalhes, AlunoDetalhes, adicionarResponsavelAluno } from "../../../utils/alunos";
import { getAdminSidebarItems } from "../../../utils/sidebarItems";
import { fetchResponsaveis } from "../../../utils/usuarios";
import Link from "next/link";
import { formatarNomeTurma } from "../../../utils/turmas";

export default function AlunoDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const alunoId = Number(params?.id);
  const [aluno, setAluno] = useState<AlunoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [usuarioId, setUsuarioId] = useState<string>("");
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [carregandoResponsaveis, setCarregandoResponsaveis] = useState(false);
  const [adicionandoResponsavel, setAdicionandoResponsavel] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const sidebarItems = getAdminSidebarItems();

  useEffect(() => {
    if (checkUserRole(router, "ADMIN")) {
      setUserData(getAuthUser());
      if (!alunoId) return;
      getAlunoDetalhes(alunoId).then((data) => {
        setAluno(data);
        setLoading(false);
      });
    }
  }, [router, alunoId]);

  const onLogout = () => {
    handleLogout();
  };

  const handleAdicionarResponsavel = async () => {
    if (!usuarioId.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um responsável' });
      return;
    }

    setAdicionandoResponsavel(true);
    const resultado = await adicionarResponsavelAluno(alunoId, Number(usuarioId));
    
    if (resultado.success) {
      setMensagem({ tipo: 'sucesso', texto: resultado.message });
      setUsuarioId("");
      setShowModal(false);

      const dados = await getAlunoDetalhes(alunoId);
      if (dados) setAluno(dados);
    } else {
      setMensagem({ tipo: 'erro', texto: resultado.message });
    }
    
    setAdicionandoResponsavel(false);
    setTimeout(() => setMensagem(null), 3000);
  };

  const handleAbrirModal = async () => {
    setShowModal(true);
    setCarregandoResponsaveis(true);
    const resp = await fetchResponsaveis();
    setResponsaveis(resp);
    setCarregandoResponsaveis(false);
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
        activeSection="alunos"
        setActiveSection={(section) => {
          router.push(`/admin/dashboard?section=${section}`);
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        userData={userData}
        onLogout={onLogout}
      />
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
              Detalhes do Aluno
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !aluno ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">Aluno não encontrado</p>
              <Link href="/admin/alunos/listar" className="text-blue-600 underline">Voltar para lista</Link>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{aluno.nome}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                  <p className="text-base text-gray-900">{new Date(aluno.dataNasc).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Turma</p>
                  <p className="text-base text-gray-900">{aluno.turma?.nome ? formatarNomeTurma(aluno.turma.nome) : "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mensalidade</p>
                  <p className="text-base text-gray-900">R$ {aluno.mensalidade?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className={`text-base font-medium ${aluno.isAtivo ? 'text-green-600' : 'text-red-600'}`}>
                    {aluno.isAtivo ? 'Ativo' : 'Inativo'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Responsáveis</h4>
                  <button
                    onClick={handleAbrirModal}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200"
                  >
                    + Adicionar
                  </button>
                </div>
                {aluno.responsaveis.length > 0 ? (
                  <ul className="space-y-2">
                    {aluno.responsaveis.map((resp) => (
                      <li key={resp.id} className="flex justify-between text-sm text-gray-600">
                        <span className="font-medium">{resp.usuario.nome}</span>
                        <span>{resp.usuario.email}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">Nenhum responsável cadastrado</p>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <Link 
                  href="/admin/alunos/listar" 
                  className="inline-block bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Voltar para lista
                </Link>
              </div>
            </div>
          )}
        </main>

        {showModal && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar Responsável</h3>

              {mensagem && (
                <div className={`p-3 rounded mb-4 text-sm ${
                  mensagem.tipo === 'sucesso'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {mensagem.texto}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione o Responsável
                </label>
                {carregandoResponsaveis ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : responsaveis.length > 0 ? (
                  <CustomSelect
                    id="responsavelSelect"
                    name="responsavel"
                    value={usuarioId}
                    onChange={(e) => setUsuarioId(e.target.value)}
                    searchable={true}
                    options={[
                      { value: '', label: '-- Selecione um responsável --' },
                      ...responsaveis.map((resp) => ({
                        value: resp.id,
                        label: resp.nome
                      }))
                    ]}
                  />
                ) : (
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded border border-gray-200">
                    Nenhum responsável disponível
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAdicionarResponsavel}
                  disabled={adicionandoResponsavel}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  {adicionandoResponsavel ? 'Adicionando...' : 'Adicionar'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setMensagem(null);
                    setUsuarioId("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
