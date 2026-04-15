import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Görgetés az oldal tetejére útvonalváltáskor
const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Képernyő pozíciójának visszaállítása a lap tetejére
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;