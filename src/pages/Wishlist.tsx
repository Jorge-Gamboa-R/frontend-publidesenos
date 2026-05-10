import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import { wishlistService } from '../services/wishlist.service';
import { useWishlistStore } from '../store/wishlistStore';
import type { WishlistItem } from '../types';

/**
 * Página de lista de deseos del usuario
 */
export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { remove, has } = useWishlistStore();

  useEffect(() => {
    wishlistService.getWishlist()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (productId: string) => {
    try {
      await remove(productId);
      setItems(prev => prev.filter(i => i.productId !== productId));
      toast.success('Eliminado de la lista de deseos');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Mi Lista de Deseos</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <FaHeart className="mx-auto text-purple-400/40 mb-4" size={64} />
          <p className="text-purple-300/60 text-lg mb-4">Tu lista de deseos está vacía</p>
          <Link to="/catalogo" className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700">
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <ProductCard key={item.id} product={item.product} isWishlisted={has(item.productId)} onToggleWishlist={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}
