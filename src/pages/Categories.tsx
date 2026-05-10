import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaArrowRight } from 'react-icons/fa';
import Spinner from '../components/ui/Spinner';
import { categoryService } from '../services/category.service';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import type { Category } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    categoryService.getAll()
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);
  useRefreshOnFocus(loadData);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Nuestras Categorías</h1>
        <p className="text-purple-300/70 text-lg max-w-2xl mx-auto">
          Explora nuestras categorías de productos personalizados y encuentra lo que necesitas
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <p className="text-center text-purple-300/70 py-16">No hay categorías disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => {
            const thumb = cat.imageUrl || cat.products?.[0]?.images?.[0]?.imageUrl;
            return (
              <Link
                key={cat.id}
                to={`/catalogo/${cat.slug}`}
                className="group bg-purple-950/50 rounded-2xl overflow-hidden border border-purple-700/30 hover:border-secondary-500/50 transition-all hover:shadow-lg hover:shadow-secondary-500/10"
              >
                <div className="h-48 bg-gradient-to-br from-primary-600/20 to-secondary-500/20 flex items-center justify-center overflow-hidden">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <FaPalette size={48} className="text-primary-400 group-hover:text-secondary-400 transition-colors" />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-white mb-2 group-hover:text-secondary-400 transition-colors">
                    {cat.name}
                  </h2>
                  {cat.description && (
                    <p className="text-sm text-purple-300/70 mb-4 line-clamp-2">{cat.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {cat._count && (
                      <span className="text-sm text-purple-300/60">
                        {cat._count.products} {cat._count.products === 1 ? 'producto' : 'productos'}
                      </span>
                    )}
                    <span className="text-primary-400 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver productos <FaArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
