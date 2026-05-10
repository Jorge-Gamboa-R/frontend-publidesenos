import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';

export function useWishlist() {
  const { toggle: storeToggle, has } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const toggle = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para usar la lista de deseos');
      return;
    }
    try {
      const wasWishlisted = has(productId);
      await storeToggle(productId);
      toast.success(wasWishlisted ? 'Eliminado de la lista de deseos' : 'Agregado a la lista de deseos');
    } catch {
      toast.error('Error al actualizar lista de deseos');
    }
  }, [isAuthenticated, storeToggle, has]);

  const isWishlisted = useCallback((productId: string) => has(productId), [has]);

  return { toggle, isWishlisted };
}
