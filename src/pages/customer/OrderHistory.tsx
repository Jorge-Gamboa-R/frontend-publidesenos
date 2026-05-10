import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { formatPrice, formatDate, translateOrderStatus, getOrderStatusColor } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import type { Order, Pagination } from '../../types';

/** Historial de pedidos del cliente */
export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    orderService.getUserOrders(page).then(data => {
      setOrders(data.orders);
      setPagination(data.pagination);
    }).finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-purple-300/60 text-lg mb-4">Aún no tienes pedidos</p>
          <Link to="/catalogo" className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700">
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order.id} to={`/mi-cuenta/pedidos/${order.id}`}
              className="block bg-purple-950/50 rounded-xl p-6 border border-purple-700/30 hover:border-primary-500/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-white">#{order.orderNumber}</span>
                  <span className="text-sm text-purple-400/50 ml-3">{formatDate(order.createdAt)}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                  {translateOrderStatus(order.status)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300/60">{order.items.length} producto(s)</span>
                <span className="font-bold text-primary-400">{formatPrice(Number(order.total))}</span>
              </div>
            </Link>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-full text-sm ${p === page ? 'bg-primary-600 text-white' : 'bg-purple-950/50 border border-purple-700/40 text-purple-200'}`}>
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
