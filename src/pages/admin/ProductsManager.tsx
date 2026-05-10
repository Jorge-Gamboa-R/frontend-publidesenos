import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaBox, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { productService } from '../../services/product.service';
import { formatPrice } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus';
import type { Product, Pagination } from '../../types';

/** Gestor de productos del admin - listar, crear, editar, eliminar */
export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProducts = () => {
    setLoading(true);
    productService.getProducts({ page, limit: 20, search: search || undefined })
      .then(data => { setProducts(data.products); setPagination(data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [page, search]);
  useRefreshOnFocus(fetchProducts);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await productService.delete(id);
      toast.success('Producto eliminado');
      fetchProducts();
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-pink-600 to-fuchsia-600 p-6 lg:p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <FaBox size={20} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Productos</h1>
              <p className="text-orange-100 text-sm mt-0.5">Cataloga, edita y publica productos personalizables</p>
            </div>
          </div>
          <Link to="/admin/productos/nuevo" className="flex items-center gap-2 bg-white text-orange-600 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            <FaPlus /> Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-orange-100/60 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={14} />
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-pink-50">
                <th className="px-4 py-3 font-medium">Producto</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-orange-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-orange-100/50">
                        {p.images?.[0] && <img src={p.images[0].imageUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-pink-600 font-medium">{p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{formatPrice(Number(p.basePrice))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    {p.isFeatured ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow shadow-amber-500/20">
                        ★ Destacado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link to={`/admin/productos/${p.id}/editar`} className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors" title="Editar"><FaEdit /></Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">No hay productos</td></tr>
              )}
            </tbody>
          </table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-orange-100 bg-orange-50/30">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${p === page ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white border border-orange-100 text-slate-600 hover:bg-orange-50'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
