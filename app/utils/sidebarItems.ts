export interface SidebarItem {
  id: string;
  label: string;
  href: string;
}

//DEFINE SIDEBAR ITEMS PARA DIFERENTES USUARIOS

export function getAdminSidebarItems(): SidebarItem[] {
  return [
    { id: "visao-geral", label: "Visão Geral", href: "#visao-geral" },
    { id: "usuarios", label: "Usuários", href: "#usuarios" },
    { id: "alunos", label: "Alunos", href: "#alunos" },
    { id: "turmas", label: "Turmas", href: "#turmas" },
    { id: "diarios", label: "Diários", href: "#diarios" },
    { id: "atividades", label: "Atividades Pedagógicas", href: "#atividades" },
    { id: "calendario", label: "Calendário", href: "#calendario" },
    { id: "cronograma", label: "Cronograma Anual", href: "#cronograma" },
  ];
}

export function getProfessorSidebarItems(): SidebarItem[] {
  return [
    { id: "visao-geral", label: "Visão Geral", href: "#visao-geral" },
    { id: "minhas-turmas", label: "Minhas Turmas", href: "#minhas-turmas" },
    { id: "atividades", label: "Atividades", href: "#atividades" },
    { id: "alunos", label: "Alunos", href: "#alunos" },
    { id: "diarios", label: "Diários", href: "#diarios" },
    { id: "calendario", label: "Calendário", href: "#calendario" },
    { id: "cronograma", label: "Cronograma", href: "#cronograma" },
    { id: "relatorios", label: "Relatórios", href: "#relatorios" },
  ];
}

export function getDiarioSidebarItems(role: string): SidebarItem[] {
  switch (role) {
    case "ADMIN":
      return [
        { id: "visao-geral", label: "Visão Geral", href: "/admin/dashboard?section=visao-geral" },
        { id: "usuarios", label: "Usuários", href: "/admin/dashboard?section=usuarios" },
        { id: "alunos", label: "Alunos", href: "/admin/dashboard?section=alunos" },
        { id: "turmas", label: "Turmas", href: "/admin/dashboard?section=turmas" },
        { id: "diarios", label: "Diários", href: "/diario" },
        { id: "atividades", label: "Atividades Pedagógicas", href: "/admin/dashboard?section=atividades" },
        { id: "calendario", label: "Calendário", href: "/admin/dashboard?section=calendario" },
        { id: "cronograma", label: "Cronograma Anual", href: "/admin/dashboard?section=cronograma" },
      ];
    case "PROFESSOR":
      return [
        { id: "visao-geral", label: "Visão Geral", href: "/professor/dashboard?section=visao-geral" },
        { id: "minhas-turmas", label: "Minhas Turmas", href: "/professor/dashboard?section=minhas-turmas" },
        { id: "atividades", label: "Atividades", href: "/professor/dashboard?section=atividades" },
        { id: "alunos", label: "Alunos", href: "/professor/dashboard?section=alunos" },
        { id: "diarios", label: "Diários", href: "/diario" },
        { id: "calendario", label: "Calendário", href: "/professor/dashboard?section=calendario" },
        { id: "cronograma", label: "Cronograma", href: "/professor/dashboard?section=cronograma" },
        { id: "relatorios", label: "Relatórios", href: "/professor/dashboard?section=relatorios" },
      ];
    default:
      return [];
  }
}

export function getSidebarItemsByRole(role: string): SidebarItem[] {
  switch (role) {
    case "ADMIN":
      return getAdminSidebarItems();
    case "PROFESSOR":
      return getProfessorSidebarItems();
    default:
      return [];
  }
}
