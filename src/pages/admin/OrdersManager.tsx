import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaChevronDown, FaChevronRight, FaChevronLeft, FaPalette, FaFont, FaTimes, FaExternalLinkAlt, FaClipboardList, FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaStickyNote, FaTruck } from 'react-icons/fa';
import { orderService } from '../../services/order.service';
import { formatPrice, formatDate, translateOrderStatus, getOrderStatusColor } from '../../utils/format';
import { parseCustomImages } from '../../utils/customization';
import Spinner from '../../components/ui/Spinner';
import type { Order, Pagination } from '../../types';

const statuses = ['', 'pending', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'];

/** Gestor de pedidos del admin - listar y actualizar estados */
export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [imageIndex, setImageIndex] = useState<Record<string, number>>({});
  const [shipModal, setShipModal] = useState<{ orderId: string; orderNumber: string; current: string } | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [shipping, setShipping] = useState(false);

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const cycleImage = (itemId: string, total: number, dir: 1 | -1) =>
    setImageIndex(prev => {
      const cur = prev[itemId] || 0;
      return { ...prev, [itemId]: (cur + dir + total) % total };
    });

  const fetchOrders = () => {
    setLoading(true);
    orderService.getAllOrders(page, 20, statusFilter || undefined)
      .then(data => { setOrders(data.orders); setPagination(data.pagination); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (newStatus === 'shipped') {
      const order = orders.find(o => o.id === orderId);
      setTrackingInput(order?.trackingNumber || '');
      setShipModal({ orderId, orderNumber: order?.orderNumber || '', current: order?.status || '' });
      return;
    }
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast.success('Estado actualizado');
      fetchOrders();
    } catch { toast.error('Error al actualizar estado'); }
  };

  const confirmShip = async () => {
    if (!shipModal) return;
    const tracking = trackingInput.trim();
    if (!tracking) {
      toast.error('Ingresa el número de guía');
      return;
    }
    setShipping(true);
    try {
      await orderService.updateStatus(shipModal.orderId, 'shipped', { trackingNumber: tracking });
      toast.success('Pedido marcado como enviado');
      setShipModal(null);
      setTrackingInput('');
      fetchOrders();
    } catch { toast.error('Error al actualizar estado'); }
    finally { setShipping(false); }
  };

  const handleEstimatedDateChange = async (orderId: string, value: string) => {
    try {
      await orderService.updateEstimatedDelivery(orderId, value || null);
      toast.success('Fecha estimada actualizada');
      fetchOrders();
    } catch { toast.error('Error al actualizar fecha estimada'); }
  };

  const toDateInput = (iso?: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 10) : '';

  const summarizeProducts = (items: any[]) => {
    if (!items || items.length === 0) return '—';
    const names = items.map(it => it.productName);
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  };

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 p-6 lg:p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
            <FaClipboardList size={20} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-pink-100 text-sm mt-0.5">Gestiona el estado y las fechas de cada pedido</p>
          </div>
        </div>
      </div>

      <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        className="px-4 py-2.5 bg-white border border-purple-100/60 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm">
        <option value="">Todos los estados</option>
        {statuses.slice(1).map(s => <option key={s} value={s}>{translateOrderStatus(s)}</option>)}
      </select>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100/60 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <th className="px-2 py-3 w-8"></th>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Productos</th>
                <th className="px-4 py-3 font-medium">Fecha compra</th>
                <th className="px-4 py-3 font-medium">Entrega est.</th>
                <th className="px-4 py-3 font-medium">Entrega real</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pago</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Cambiar</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const items = (order as any).items as any[] || [];
                const isOpen = !!expanded[order.id];
                const totalQty = items.reduce((s, it) => s + (it.quantity || 0), 0);
                const categories = Array.from(
                  new Set(items.map(it => it.product?.category?.name).filter(Boolean))
                );
                return (
                  <Fragment key={order.id}>
                    <tr className="border-b border-slate-100 hover:bg-pink-50/30 transition-colors">
                      <td className="px-2 py-3 text-center">
                        <button onClick={() => toggle(order.id)} className="p-1 text-purple-400 hover:text-purple-700"
                          aria-label={isOpen ? 'Cerrar detalle' : 'Ver detalle'}>
                          {isOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">#{order.orderNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{order.user?.firstName} {order.user?.lastName}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-800">{summarizeProducts(items)}</span>
                          <div className="flex flex-wrap gap-1">
                            {categories.map(cat => (
                              <span key={cat} className="text-[10px] bg-gradient-to-r from-pink-50 to-orange-50 text-pink-700 border border-pink-100 px-1.5 py-0.5 rounded-full">
                                {cat}
                              </span>
                            ))}
                            <span className="text-[10px] text-slate-400">{totalQty} {totalQty === 1 ? 'unidad' : 'unidades'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={toDateInput(order.estimatedDeliveryDate)}
                          onChange={e => handleEstimatedDateChange(order.id, e.target.value)}
                          className="px-2 py-1 border border-purple-100 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {order.actualDeliveryDate ? formatDate(order.actualDeliveryDate) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatPrice(Number(order.total))}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.payment?.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                          {order.payment?.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                            {translateOrderStatus(order.status)}
                          </span>
                          {order.trackingNumber && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-mono" title="Número de guía">
                              <FaTruck size={9} /> {order.trackingNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                          className="px-2 py-1.5 border border-purple-100 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          {statuses.slice(1).map(s => <option key={s} value={s}>{translateOrderStatus(s)}</option>)}
                        </select>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-gradient-to-r from-purple-50/40 to-pink-50/40 border-b border-purple-100">
                        <td></td>
                        <td colSpan={10} className="px-4 py-3 space-y-3">
                          {/* Datos de envío y contacto */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl border border-purple-100 p-3">
                              <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <FaMapMarkerAlt size={11} /> Dirección de envío
                              </h4>
                              {(order as any).address ? (
                                <div className="text-sm text-slate-700 space-y-0.5">
                                  {(order as any).address.label && (
                                    <p className="font-medium">{(order as any).address.label}</p>
                                  )}
                                  <p>{(order as any).address.street}</p>
                                  <p className="text-slate-500 text-xs">
                                    {(order as any).address.city}, {(order as any).address.state}
                                    {(order as any).address.postalCode ? ` · CP ${(order as any).address.postalCode}` : ''}
                                  </p>
                                  <p className="text-slate-500 text-xs">{(order as any).address.country || 'Colombia'}</p>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400">Sin dirección registrada</p>
                              )}
                            </div>
                            <div className="bg-white rounded-xl border border-purple-100 p-3">
                              <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <FaPhone size={10} /> Contacto del cliente
                              </h4>
                              <div className="text-sm text-slate-700 space-y-1">
                                <p className="font-medium">{order.user?.firstName} {order.user?.lastName}</p>
                                {order.user?.email && (
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="flex items-center gap-1.5 text-slate-600 break-all">
                                      <FaEnvelope size={10} /> {order.user.email}
                                    </span>
                                    <a
                                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(order.user.email)}&su=${encodeURIComponent(`Pedido #${order.orderNumber}`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-100"
                                    >
                                      Gmail
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(order.user!.email!);
                                        toast.success('Email copiado');
                                      }}
                                      className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded hover:bg-slate-200"
                                    >
                                      Copiar
                                    </button>
                                  </div>
                                )}
                                {(order.user as any)?.phone && (
                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                      <FaPhone size={10} /> {(order.user as any).phone}
                                    </span>
                                    <a
                                      href={`https://wa.me/${(order.user as any).phone.replace(/\D/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded hover:bg-green-100"
                                    >
                                      <FaWhatsapp size={10} /> WhatsApp
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {(order as any).notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                <FaStickyNote size={10} /> Notas del pedido
                              </h4>
                              <p className="text-sm text-amber-900 whitespace-pre-wrap">{(order as any).notes}</p>
                            </div>
                          )}

                          {items.length === 0 ? (
                            <p className="text-xs text-slate-500">Sin detalle de productos.</p>
                          ) : (
                            <ul className="divide-y divide-purple-100/50 bg-white rounded-xl border border-purple-100">
                              {items.map((it: any) => {
                                const c = it.customization;
                                const { previewUrl, originals } = parseCustomImages(c?.customImageUrl);
                                const customImages = originals;
                                const curIdx = imageIndex[it.id] || 0;
                                const safeIdx = Math.min(curIdx, Math.max(0, customImages.length - 1));
                                return (
                                  <li key={it.id} className="p-3 flex items-start justify-between gap-3">
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
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800">{it.productName}</p>
                                        <p className="text-xs text-gray-500">
                                          {it.product?.category?.name ? `${it.product.category.name} · ` : ''}
                                          Cant. {it.quantity} × {formatPrice(Number(it.unitPrice))}
                                        </p>
                                        {c && (c.customText || customImages.length > 0 || previewUrl || c.selectedColor) && (
                                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                            {c.customText && (
                                              <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded">
                                                <FaFont size={10} /> "{c.customText}"
                                              </span>
                                            )}
                                            {previewUrl && (
                                              <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded hover:underline font-medium">
                                                <FaExternalLinkAlt size={9} /> Abrir vista previa
                                              </a>
                                            )}
                                            {customImages.map((url, i) => (
                                              <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded hover:underline">
                                                <FaExternalLinkAlt size={9} /> Imagen original {customImages.length > 1 ? `${i + 1} ` : ''}
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
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {shipModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => !shipping && setShipModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <FaTruck size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Marcar como enviado</h3>
                <p className="text-xs text-slate-500">Pedido #{shipModal.orderNumber}</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Número de guía</label>
            <input
              type="text"
              value={trackingInput}
              onChange={e => setTrackingInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !shipping) confirmShip(); }}
              autoFocus
              maxLength={100}
              placeholder="Ej. 1234567890"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-2">Se incluirá en el correo de notificación al cliente.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShipModal(null)}
                disabled={shipping}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmShip}
                disabled={shipping || !trackingInput.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {shipping ? 'Enviando…' : 'Confirmar envío'}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
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
