import { useEffect, useRef } from 'react';

/**
 * Ejecuta `callback` cuando la pestaña recupera el foco.
 * Útil para refrescar datos al volver de otro navegador/pestaña sin recargar.
 */
export function useRefreshOnFocus(callback: () => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') callbackRef.current();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
