'use client';

import Image from 'next/image';

interface SidebarHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function SidebarHeader({ 
  title = 'Elo Web', 
  subtitle = 'Painel Administrativo' 
}: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b flex items-center">
      <Image
        src="/logo.png"
        alt="Elo Web"
        width={60}
        height={60}
        className="mr-3"
      />
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  );
}
