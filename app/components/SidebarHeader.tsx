'use client';

import Image from 'next/image';

interface SidebarHeaderProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function SidebarHeader({ 
  onClose,
  showCloseButton = false
}: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Elo Web"
          width={60}
          height={60}
          className="mr-3"
        />
      </div>
      
      {showCloseButton && onClose && (
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 lg:hidden"
          aria-label="Fechar menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
