import { SidebarHeader } from "./index";

interface SidebarProps {
  items: Array<{
    id: string;
    label: string;
    href: string;
  }>;
  activeSection: string;
  setActiveSection: (section: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  userData: {
    nome: string;
    email: string;
  };
  onLogout: () => void;
}

export function Sidebar({
  items,
  activeSection,
  setActiveSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  userData,
  onLogout,
}: SidebarProps) {
  return (
    <>
      {/* Overlay para fechar o menu em dispositivos móveis */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Menu lateral */}
      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 w-64 bg-white shadow-md z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0`}
      >
        <SidebarHeader
          onClose={() => setMobileMenuOpen(false)}
          showCloseButton={true}
        />

        <nav className="p-2">
          <ul>
            {items.map((item) => (
              <li key={item.id} className="mb-1">
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block rounded-md px-4 py-2 text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:absolute lg:bottom-0 w-full border-t p-4 mt-6 lg:mt-0">
          <div className="mb-2">
            <p className="font-medium text-sm">{userData.nome}</p>
            <p className="text-xs text-gray-600">{userData.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
