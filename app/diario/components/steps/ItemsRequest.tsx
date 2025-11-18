'use client';

interface ItemsRequestProps {
  value?: string[];
  onChange: (items: string[]) => void;
}

const AVAILABLE_ITEMS = [
  { id: 'FRALDA', label: 'Fralda' },
  { id: 'LENCO_UMEDECIDO', label: 'Lenços Umedecidos' },
  { id: 'POMADA', label: 'Pomada' },
  { id: 'LEITE', label: 'Leite' },
  { id: 'ESCOVA_DE_DENTE', label: 'Escova de Dente' },
  { id: 'CREME_DENTAL', label: 'Creme Dental' },
];

export default function ItemsRequest({ value = [], onChange }: ItemsRequestProps) {
  const selectedItems = Array.isArray(value) ? value : [];

  const handleToggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      onChange(selectedItems.filter((i) => i !== item));
    } else {
      onChange([...selectedItems, item]);
    }
  };

  const handleRemoveItem = (item: string) => {
    onChange(selectedItems.filter((i) => i !== item));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="hidden md:block text-xl font-semibold text-gray-800">Itens Requisitados</h2>
        <p className="text-xs md:text-sm text-gray-600 mt-1">Selecione os itens que precisam ser providenciados para a criança.</p>
      </div>

      <div>
        <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-3">Itens disponíveis:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2">
          {AVAILABLE_ITEMS.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`flex items-center gap-2 p-2 md:p-3 rounded-lg border-2 transition-all duration-200 w-full min-w-0 box-border ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className={`text-xs md:text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumo de itens selecionados */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 md:p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2 md:mb-3 text-sm md:text-base">
            Itens selecionados ({selectedItems.length}):
          </h3>
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-1 md:gap-2 bg-white p-2 md:p-3 rounded border border-blue-100 hover:border-blue-300 transition min-w-0"
              >
                <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1">
                  <svg
                    className="w-3 h-3 md:w-4 md:h-4 text-blue-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 truncate text-xs md:text-sm">{item}</span>
                </div>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition flex-shrink-0"
                  title="Remover item"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem quando nenhum item é selecionado */}
      {selectedItems.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Nenhum item selecionado
        </div>
      )}
    </div>
  );
}
