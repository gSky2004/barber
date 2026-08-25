import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from '../utils/scrollTo';

export function useHashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname === '/' && hash) {
      const id = hash.replace('#', '');
      setTimeout(() => scrollToSection(id), 100);
    }
  }, [pathname, hash]);
}
