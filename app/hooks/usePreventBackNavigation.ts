import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// PREVINE QUE USUARIOS RETORNEM À PÁGINA DE LOGIN APÓS LOGAR

export function usePreventBackNavigation() {
  const router = useRouter();

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);
}
