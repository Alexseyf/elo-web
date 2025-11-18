'use client';

import { useRouter } from 'next/navigation';
import { Usuario } from '../utils/usuarios';

interface UsersTableProps {
  title: string;
  users: Usuario[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function UsersTable({ title, users, loading, error, onRetry }: UsersTableProps) {
  const router = useRouter();
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 sm:px-6 py-3 border-b">
        <h3 className="font-semibold text-sm md:text-base text-gray-700">{title} ({users?.length || 0})</h3>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
          <p className="text-sm">{error}</p>
          <button 
            onClick={onRetry} 
            className="mt-2 text-xs sm:text-sm underline hover:text-red-800"
          >
            Tentar novamente
          </button>
        </div>
      ) : users?.length === 0 ? (
        <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {usuario.nome}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 max-w-[120px] sm:max-w-none truncate">
                    {usuario.email}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    {usuario.isAtivo ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Ativo
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                    <div className="flex gap-2 justify-end flex-wrap">
                      <button
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-2 py-1 rounded text-xs"
                        onClick={() => router.push(`/admin/usuarios/${usuario.id}`)}
                      >
                        Detalhes
                      </button>
                      <button
                        className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-2 py-1 rounded text-xs"
                        onClick={() => {/* Implementar edição */}}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
