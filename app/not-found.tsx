export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">404</h1>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">Página não encontrada</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Desculpe, a página que você está procurando está em desenvolvimento.
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Voltar para a página inicial
      </a>
    </div>
  );
}
