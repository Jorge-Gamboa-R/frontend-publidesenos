import { useEffect, useState } from 'react';
import { FaSearch, FaUser, FaShoppingCart, FaStar, FaEnvelope, FaPhone, FaTimes, FaMapMarkerAlt, FaChevronDown, FaChevronRight, FaChevronLeft, FaPalette, FaImage, FaFont, FaTrash, FaUsers } from 'react-icons/fa';
import { adminService } from '../../services/admin.service';
import { formatDate, formatPrice, translateOrderStatus, getOrderStatusColor } from '../../utils/format';
import { parseCustomImages } from '../../utils/customization';
import StarRating from '../../components/ui/StarRating';
import Spinner from '../../components/ui/Spinner';
import type { Pagination } from '../../types';

interface CustomerSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  authProvider: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number; reviews: number };
}

interface CustomerDetail extends CustomerSummary {
  addresses: any[];
  orders: any[];
  reviews: any[];
  _count: { orders: number; reviews: number; wishlistItems: number };
}

export default function CustomersManager() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [imageIndex, setImageIndex] = useState<Record<string, number>>({});

  const toggleOrder = (id: string) => setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  const cycleImage = (itemId: string, total: number, dir: 1 | -1) =>
    setImageIndex(prev => {
      const cur = prev[itemId] || 0;
      return { ...prev, [itemId]: (cur + dir + total) % total };
    });

  const fetchCustomers = () => {
    setLoading(true);
    adminService.getCustomers({ page, limit: 20, search: search || undefined })
      .then(data => { setCustomers(data.customers); setPagination(data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(
      `¿Eliminar definitivamente al cliente "${name}"?\n\n` +
      `Esta acción no se puede deshacer. Se borrarán direcciones, carrito, lista de deseos y reseñas. ` +
      `Los pedidos quedarán anonimizados (sin cliente asociado). El correo quedará libre para registrarse de nuevo.`
    );
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await adminService.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      if (selected?.id === id) setSelected(null);
      setPagination(prev => prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev);
    } catch {
      alert('No se pudo eliminar el cliente.');
    } finally {
      setDeletingId(null);
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const detail = await adminService.getCustomerDetail(id);
      setSelected(detail);
    } catch {
      // ignore
    }
    setDetailLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-6 lg:p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-fuchsia-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <FaUsers size={20} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Clientes</h1>
              <p className="text-pink-100 text-sm mt-0.5">Listado y detalle de cada cliente registrado</p>
            </div>
          </div>
          {pagination && (
            <span className="bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-xl border border-white/30">
              {pagination.total} {pagination.total === 1 ? 'cliente' : 'clientes'}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-purple-100/60 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm" />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={14} />
        </div>
        <button type="submit" className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
          Buscar
        </button>
      </form>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Pedidos</th>
                  <th className="px-4 py-3 font-medium">Reseñas</th>
                  <th className="px-4 py-3 font-medium">Registro</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md shadow-purple-500/30">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <span className="font-semibold text-slate-800">{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-center">{c._count.orders}</td>
                    <td className="px-4 py-3 text-center">{c._count.reviews}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${c.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {c.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openDetail(c.id)} className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
                          Ver detalle
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, `${c.firstName} ${c.lastName}`)}
                          disabled={deletingId === c.id}
                          className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                          title="Eliminar cliente"
                        >
                          <FaTrash size={12} />
                          {deletingId === c.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500">No se encontraron clientes</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-purple-100 bg-purple-50/30">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${p === page ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white shadow-lg shadow-purple-500/30' : 'bg-white border border-purple-100 text-slate-600 hover:bg-purple-50'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal detalle cliente */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => !detailLoading && setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {detailLoading ? <div className="p-8"><Spinner /></div> : selected && (
              <>
                <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-5 text-white flex items-center justify-between">
                  <h2 className="text-xl font-bold">Detalle del Cliente</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(selected.id, `${selected.firstName} ${selected.lastName}`)}
                      disabled={deletingId === selected.id}
                      className="px-3 py-1.5 bg-white/20 text-white hover:bg-white/30 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 backdrop-blur"
                    >
                      <FaTrash size={12} />
                      {deletingId === selected.id ? 'Eliminando…' : 'Eliminar'}
                    </button>
                    <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/20 rounded-lg"><FaTimes /></button>
                  </div>
                </div>
                <div className="p-6">

                {/* Info básica */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-500/20">
                    {selected.firstName[0]}{selected.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{selected.firstName} {selected.lastName}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><FaEnvelope size={12} /> {selected.email}</span>
                      {selected.phone && <span className="flex items-center gap-1"><FaPhone size={12} /> {selected.phone}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selected.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selected.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="text-xs text-gray-400">Registrado: {formatDate(selected.createdAt)}</span>
                      <span className="text-xs text-gray-400">Auth: {selected.authProvider}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4 text-center">
                    <FaShoppingCart className="mx-auto text-blue-500 mb-1" />
                    <p className="text-xl font-bold text-slate-800">{selected._count.orders}</p>
                    <p className="text-xs text-slate-500">Pedidos</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-xl p-4 text-center">
                    <FaStar className="mx-auto text-amber-500 mb-1" />
                    <p className="text-xl font-bold text-slate-800">{selected._count.reviews}</p>
                    <p className="text-xs text-slate-500">Reseñas</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-4 text-center">
                    <FaUser className="mx-auto text-rose-500 mb-1" />
                    <p className="text-xl font-bold text-slate-800">{selected._count.wishlistItems}</p>
                    <p className="text-xs text-slate-500">En lista de deseos</p>
                  </div>
                </div>

                {/* Direcciones */}
                {selected.addresses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaMapMarkerAlt /> Direcciones</h4>
                    <div className="space-y-2">
                      {selected.addresses.map((addr: any) => (
                        <div key={addr.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="font-medium">{addr.label || 'Dirección'}: </span>
                          {addr.street}, {addr.city}, {addr.state} {addr.postalCode} - {addr.country}
                          {addr.isDefault && <span className="ml-2 text-xs text-green-600 font-medium">(Predeterminada)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedidos recientes */}
                {selected.orders.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaShoppingCart /> Pedidos recientes</h4>
                    <div className="space-y-2">
                      {selected.orders.map((order: any) => {
                        const items: any[] = order.items || [];
                        const isOpen = !!expandedOrders[order.id];
                        const categoryNames = Array.from(
                          new Set(items.map(it => it.product?.category?.name).filter(Boolean))
                        );
                        const totalQty = items.reduce((s, it) => s + (it.quantity || 0), 0);
                        return (
                          <div key={order.id} className="border rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => toggleOrder(order.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-left text-sm"
                            >
                              {isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                              <span className="font-medium">#{order.orderNumber}</span>
                              <span className="text-gray-500 text-xs">{formatDate(order.createdAt)}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                {translateOrderStatus(order.status)}
                              </span>
                              {categoryNames.length > 0 && (
                                <span className="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                                  {categoryNames.join(' · ')}
                                </span>
                              )}
                              <span className="ml-auto text-xs text-gray-500">
                                {totalQty} {totalQty === 1 ? 'unidad' : 'unidades'}
                              </span>
                              <span className="font-medium">{formatPrice(Number(order.total))}</span>
                            </button>
                            {isOpen && (
                              <div className="px-3 py-2 bg-white border-t">
                                {items.length === 0 ? (
                                  <p className="text-xs text-gray-500 py-1">Sin detalle de productos.</p>
                                ) : (
                                  <ul className="divide-y">
                                    {items.map((it: any) => {
                                      const c = it.customization;
                                      const { previewUrl, originals } = parseCustomImages(c?.customImageUrl);
                                      const customImages = originals;
                                      const curIdx = imageIndex[it.id] || 0;
                                      const safeIdx = Math.min(curIdx, Math.max(0, customImages.length - 1));
                                      return (
                                        <li key={it.id} className="py-2 flex items-start justify-between gap-3">
                                          <div className="flex items-start gap-3 min-w-0 flex-1">
                                            {previewUrl && (
                                              <div className="flex-shrink-0">
                                                <button
                                                  type="button"
                                                  onClick={() => setLightbox({ images: [previewUrl], index: 0 })}
                                                  className="block w-24 h-24 rounded-lg overflow-hidden border-2 border-purple-400 hover:border-purple-600 ring-2 ring-purple-200 transition-colors bg-gray-50 relative"
                                                  title="Vista previa tal como la armó el cliente"
                                                >
                                                  <img src={previewUrl} alt="Vista previa del cliente" className="w-full h-full object-contain" />
                                                  <span className="absolute top-0.5 left-0.5 right-0.5 bg-purple-600 text-white text-[9px] font-bold px-1 py-0.5 rounded text-center leading-tight">
                                                    VISTA PREVIA
                                                  </span>
                                                </button>
                                              </div>
                                            )}
                                            {customImages.length > 0 && (
                                              <div className="relative flex-shrink-0 w-20 h-20">
                                                <button
                                                  type="button"
                                                  onClick={() => setLightbox({ images: customImages, index: safeIdx })}
                                                  className="block w-full h-full rounded-lg overflow-hidden border-2 border-blue-200 hover:border-blue-500 transition-colors bg-gray-100"
                                                  title="Imagen original subida por el cliente (alta resolución)"
                                                >
                                                  <img src={customImages[safeIdx]} alt={`Imagen del cliente ${safeIdx + 1}`} className="w-full h-full object-cover" />
                                                </button>
                                                {customImages.length > 1 && (
                                                  <>
                                                    <button
                                                      type="button"
                                                      onClick={() => cycleImage(it.id, customImages.length, -1)}
                                                      className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-700 z-10"
                                                      aria-label="Imagen anterior"
                                                    >
                                                      <FaChevronLeft size={10} />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => cycleImage(it.id, customImages.length, 1)}
                                                      className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full w-6 h-6 flex items-center justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-700 z-10"
                                                      aria-label="Imagen siguiente"
                                                    >
                                                      <FaChevronRight size={10} />
                                                    </button>
                                                    <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded pointer-events-none">
                                                      {safeIdx + 1}/{customImages.length}
                                                    </span>
                                                  </>
                                                )}
                                              </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                              <p className="text-sm font-medium text-gray-800 truncate">{it.productName}</p>
                                              <p className="text-xs text-gray-500">
                                                {it.product?.category?.name ? `${it.product.category.name} · ` : ''}
                                                Cant. {it.quantity} × {formatPrice(Number(it.unitPrice))}
                                              </p>
                                              {c && (c.customText || customImages.length > 0 || previewUrl || c.selectedColor) && (
                                                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                  {c.customText && (
                                                    <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded">
                                                      <FaFont size={10} /> "{c.customText}"
                                                    </span>
                                                  )}
                                                  {previewUrl && (
                                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                                                      className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded hover:underline font-medium">
                                                      <FaImage size={10} /> Vista previa
                                                    </a>
                                                  )}
                                                  {customImages.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded hover:underline">
                                                      <FaImage size={10} /> Original {customImages.length > 1 ? i + 1 : ''}
                                                    </a>
                                                  ))}
                                                  {c.selectedColor && (
                                                    <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 px-2 py-0.5 rounded">
                                                      <FaPalette size={10} />
                                                      <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: c.selectedColor.hexCode }} />
                                                      {c.selectedColor.colorName}
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <span className="text-sm font-medium whitespace-nowrap">{formatPrice(Number(it.subtotal))}</span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 mt-2 border-t">
                                  <span>Pago: <span className="font-medium">{order.payment?.status || '—'}</span>{order.payment?.method ? ` · ${order.payment.method}` : ''}</span>
                                  <span>Total: <span className="font-semibold text-gray-800">{formatPrice(Number(order.total))}</span></span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reseñas recientes */}
                {selected.reviews.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><FaStar /> Reseñas recientes</h4>
                    <div className="space-y-3">
                      {selected.reviews.map((review: any) => (
                        <div key={review.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-slate-800">{review.product?.name}</span>
                            <StarRating rating={review.rating} size={14} />
                          </div>
                          {review.comment && <p className="text-sm text-slate-600">{review.comment}</p>}
                          <p className="text-xs text-slate-400 mt-1">{formatDate(review.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/40 rounded-full p-2"
            aria-label="Cerrar"
          >
            <FaTimes size={20} />
          </button>
          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setLightbox(lb => lb && ({ ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-full p-3"
                aria-label="Imagen anterior"
              >
                <FaChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setLightbox(lb => lb && ({ ...lb, index: (lb.index + 1) % lb.images.length }));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black/40 hover:bg-black/60 rounded-full p-3"
                aria-label="Imagen siguiente"
              >
                <FaChevronRight size={20} />
              </button>
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-medium px-3 py-1 rounded-full">
                {lightbox.index + 1} / {lightbox.images.length}
              </span>
            </>
          )}
          <img
            src={lightbox.images[lightbox.index]}
            alt={`Imagen del cliente ${lightbox.index + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
