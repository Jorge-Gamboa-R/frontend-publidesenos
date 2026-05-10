import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaSync, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { orderService } from '../../services/order.service';
import { reviewService } from '../../services/review.service';
import { paymentService } from '../../services/payment.service';
import { useCartStore } from '../../store/cartStore';
import { formatPrice, formatDate, translateOrderStatus, translatePaymentStatus, getOrderStatusColor } from '../../utils/format';
import { parseCustomImages } from '../../utils/customization';
import Spinner from '../../components/ui/Spinner';
import ReviewModal from '../../components/ui/ReviewModal';
import type { Order } from '../../types';

/** Detalle de una orden individual del cliente */
export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<{ productId: string; productName: string } | null>(null);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { fetchCart } = useCartStore();

  const reloadOrder = () => {
    if (id) orderService.getById(id).then(setOrder);
  };

  const handleCancelOrder = async () => {
    if (!id) return;
    if (!confirm('¿Estás seguro de cancelar este pedido? Esta acción no se puede deshacer.')) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancel(id);
      setOrder(updated);
      await fetchCart();
      toast.success('Pedido cancelado correctamente');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'No se pudo cancelar el pedido';
      toast.error(msg, { duration: 5000 });
    } finally {
      setCancelling(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!id) return;
    setVerifyingPayment(true);
    try {
      const r = await paymentService.verify(id);
      if (r.status === 'completed') toast.success('Pago confirmado');
      else if (r.status === 'failed') toast.error('El pago fue rechazado');
      else toast('Pago aún en proceso, intenta en unos segundos', { icon: '⏱️' });
      reloadOrder();
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = data?.detail || data?.error || err?.message || 'No se pudo verificar el pago';
      console.error('[verify] error:', err?.response?.status, data);
      toast.error(msg, { duration: 6000 });
    } finally {
      setVerifyingPayment(false);
    }
  };

  useEffect(() => {
    if (id) orderService.getById(id).then(setOrder).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order || order.status !== 'delivered') return;
    const productIds = Array.from(new Set(order.items.map(i => i.productId).filter(Boolean))) as string[];
    Promise.all(productIds.map(pid =>
      reviewService.getEligibility(pid).then(r => [pid, r.hasReviewed] as const).catch(() => [pid, false] as const)
    )).then(results => {
      setReviewed(Object.fromEntries(results));
    });
  }, [order]);

  const isDelivered = order?.status === 'delivered';

  if (loading) return <Spinner size="lg" />;
  if (!order) return <div className="text-center py-20 text-purple-300/60">Orden no encontrada</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/mi-cuenta/pedidos" className="text-primary-400 text-sm hover:underline mb-4 block">&larr; Volver a pedidos</Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Pedido #{order.orderNumber}</h1>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
          {translateOrderStatus(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
            <h2 className="font-bold text-white mb-4">Productos</h2>
            <div className="space-y-4">
              {order.items.map(item => {
                const pid = item.productId || '';
                const alreadyReviewed = pid ? reviewed[pid] : false;
                const { previewUrl } = parseCustomImages(item.customization?.customImageUrl);
                return (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-purple-700/30 last:border-0">
                    <div className="w-16 h-16 bg-purple-900/30 rounded-lg overflow-hidden flex-shrink-0">
                      {previewUrl ? (
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer" title="Ver tu personalización">
                          <img src={previewUrl} alt="Tu personalización" className="w-full h-full object-contain bg-white" />
                        </a>
                      ) : item.product?.images?.[0] && (
                        <img src={item.product.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.productName}</p>
                      <p className="text-sm text-purple-300/60">Cantidad: {item.quantity} x {formatPrice(Number(item.unitPrice))}</p>
                      {item.customization?.customText && (
                        <p className="text-xs text-purple-400/50 mt-1">Texto: {item.customization.customText}</p>
                      )}
                      {isDelivered && pid && (
                        alreadyReviewed ? (
                          <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-400">
                            <FaStar size={10} /> Ya reseñaste este producto
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReviewing({ productId: pid, productName: item.productName })}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-300 hover:text-primary-200 hover:underline"
                          >
                            <FaStar size={10} /> Calificar y dejar reseña
                          </button>
                        )
                      )}
                    </div>
                    <span className="font-bold text-purple-100">{formatPrice(Number(item.subtotal))}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Número de guía */}
          {order.status === 'shipped' && order.trackingNumber && (
            <div className="bg-blue-950/40 rounded-xl p-6 border border-blue-500/30">
              <h2 className="font-bold text-white mb-2">Número de guía</h2>
              <p className="text-2xl font-mono font-bold text-blue-300 tracking-wider">{order.trackingNumber}</p>
              <p className="text-sm text-purple-300/60 mt-2">Usa este número en la web del transportador para rastrear tu envío.</p>
            </div>
          )}

          {/* Dirección */}
          {order.address && (
            <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
              <h2 className="font-bold text-white mb-2">Dirección de envío</h2>
              <p className="text-purple-200">{order.address.street}</p>
              <p className="text-purple-300/60">{order.address.city}, {order.address.state} {order.address.postalCode}</p>
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30 h-fit">
          <h2 className="font-bold text-white mb-4">Resumen</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-purple-300/60">Fecha</span><span className="text-purple-100">{formatDate(order.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-purple-300/60">Subtotal</span><span className="text-purple-100">{formatPrice(Number(order.subtotal))}</span></div>
            <div className="flex justify-between"><span className="text-purple-300/60">IVA</span><span className="text-purple-100">{formatPrice(Number(order.tax))}</span></div>
            <div className="flex justify-between"><span className="text-purple-300/60">Envío</span><span className="text-purple-100">{Number(order.shippingCost) === 0 ? 'Gratis' : formatPrice(Number(order.shippingCost))}</span></div>
            <hr className="border-purple-700/30" />
            <div className="flex justify-between text-lg font-bold"><span className="text-white">Total</span><span className="text-primary-400">{formatPrice(Number(order.total))}</span></div>
          </div>

          {order.payment && (
            <div className="mt-4 pt-4 border-t border-purple-700/30">
              <h3 className="font-medium text-purple-200 mb-2">Pago</h3>
              <p className="text-sm text-purple-300/60">Estado: {translatePaymentStatus(order.payment.status)}</p>
              {(order.payment.status === 'pending' || order.payment.status === 'processing') && (
                <button
                  onClick={handleVerifyPayment}
                  disabled={verifyingPayment}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-primary-600/80 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg"
                >
                  <FaSync className={verifyingPayment ? 'animate-spin' : ''} />
                  {verifyingPayment ? 'Consultando Wompi…' : 'Verificar pago'}
                </button>
              )}
            </div>
          )}

          {(order.status === 'pending' || order.status === 'confirmed') && (
            <div className="mt-4 pt-4 border-t border-purple-700/30">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-red-600/80 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                <FaTimesCircle />
                {cancelling ? 'Cancelando...' : 'Cancelar pedido'}
              </button>
              <p className="text-[11px] text-purple-300/60 mt-2 leading-relaxed">
                Puedes cancelar mientras el pedido esté pendiente o confirmado. Una vez en producción, contáctanos por WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>

      {reviewing && (
        <ReviewModal
          productId={reviewing.productId}
          productName={reviewing.productName}
          onClose={() => setReviewing(null)}
          onSubmitted={() => setReviewed(prev => ({ ...prev, [reviewing.productId]: true }))}
        />
      )}
    </div>
  );
}
