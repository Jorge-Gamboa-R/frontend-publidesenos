import { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { FaFilter, FaTimes } from 'react-icons/fa';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { useWishlist } from '../hooks/useWishlist';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import type { Product, Category, Pagination } from '../types';

/**
 * Página de catálogo con filtros, búsqueda y paginación.
 */
export default function Catalog() {
  const { categoriaSlug } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { toggle, isWishlisted } = useWishlist();

  // Lee los parámetros directamente desde location.search para garantizar
  // que reacciona ante cada cambio de navegación, incluso cuando sólo
  // cambia el query string.
  const urlParams = new URLSearchParams(location.search);
  const page = parseInt(urlParams.get('page') || '1');
  const search = urlParams.get('search') || '';
  const sort = urlParams.get('sort') || 'newest';
  const minPrice = urlParams.get('minPrice') || '';
  const maxPrice = urlParams.get('maxPrice') || '';

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => {});
  }, []);

  const loadProducts = () => {
    setLoading(true);
    productService.getProducts({
      page,
      limit: 12,
      category: categoriaSlug,
      search: search || undefined,
      sort,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }).then(data => {
      setProducts(data.products);
      setPagination(data.pagination);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, [page, categoriaSlug, search, sort, minPrice, maxPrice]);
  useRefreshOnFocus(loadProducts);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {categoriaSlug ? categories.find(c => c.slug === categoriaSlug)?.name || 'Categoría' : 'Catálogo'}
          </h1>
          {search && <p className="text-purple-300/70 mt-1">Resultados para: "{search}"</p>}
          {pagination && <p className="text-sm text-purple-400/50 mt-1">{pagination.total} productos encontrados</p>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2 bg-purple-950/50 border border-purple-700/30 rounded-lg text-sm text-purple-200">
          <FaFilter /> Filtros
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-[#1a0a2e] p-6 overflow-auto' : 'hidden'} md:block md:relative md:w-64 flex-shrink-0`}>
          <div className="flex items-center justify-between md:hidden mb-4">
            <h2 className="text-lg font-bold text-white">Filtros</h2>
            <button onClick={() => setShowFilters(false)} className="text-purple-200"><FaTimes /></button>
          </div>

          {/* Categorías */}
          <div className="mb-6">
            <h3 className="font-semibold text-purple-100 mb-3">Categorías</h3>
            <ul className="space-y-2">
              <li>
                <a href="/catalogo" className={`text-sm ${!categoriaSlug ? 'text-secondary-400 font-medium' : 'text-purple-300/70 hover:text-primary-400'}`}>
                  Todas
                </a>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <a href={`/catalogo/${cat.slug}`}
                    className={`text-sm ${categoriaSlug === cat.slug ? 'text-secondary-400 font-medium' : 'text-purple-300/70 hover:text-primary-400'}`}>
                    {cat.name} {cat._count && <span className="text-purple-400/50">({cat._count.products})</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Precio */}
          <div className="mb-6">
            <h3 className="font-semibold text-purple-100 mb-3">Precio</h3>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
                className="w-full px-3 py-2 bg-purple-950/50 border border-purple-700/40 rounded text-sm text-white placeholder-purple-400/50" />
              <input type="number" placeholder="Max" value={maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
                className="w-full px-3 py-2 bg-purple-950/50 border border-purple-700/40 rounded text-sm text-white placeholder-purple-400/50" />
            </div>
          </div>

          {/* Ordenar */}
          <div className="mb-6">
            <h3 className="font-semibold text-purple-100 mb-3">Ordenar por</h3>
            <select value={sort} onChange={e => updateFilter('sort', e.target.value)}
              className="w-full px-3 py-2 bg-purple-950/50 border border-purple-700/40 rounded text-sm text-white">
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="rating">Mejor calificados</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? <Spinner /> : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-purple-300/70 text-lg">No se encontraron productos</p>
              <p className="text-purple-400/50 text-sm mt-2">Intenta con otros filtros o busca algo diferente</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} isWishlisted={isWishlisted(product.id)} onToggleWishlist={toggle} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => updateFilter('page', String(p))}
                      className={`w-10 h-10 rounded-full text-sm font-medium ${
                        p === page ? 'bg-gradient-to-r from-primary-600 to-secondary-500 text-white' : 'bg-purple-950/50 text-purple-200 border border-purple-700/30 hover:bg-purple-900/50'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
