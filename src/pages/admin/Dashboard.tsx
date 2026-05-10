import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaClipboardList, FaUsers, FaDollarSign, FaStar, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import { adminService } from '../../services/admin.service';
import { useAuthStore } from '../../store/authStore';
import { formatPrice, formatDate, translateOrderStatus, getOrderStatusColor } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import type { AdminDashboardStats } from '../../types';

/** Dashboard principal del admin con estadísticas y órdenes recientes */
export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    adminService.getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;
  if (!stats) return null;

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const cards = [
    { label: 'Productos', value: stats.totalProducts, icon: FaBox, gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/30', to: '/admin/productos' },
    { label: 'Pedidos', value: stats.totalOrders, icon: FaClipboardList, gradient: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/30', to: '/admin/pedidos' },
    { label: 'Clientes', value: stats.totalUsers, icon: FaUsers, gradient: 'from-purple-500 to-fuchsia-500', shadow: 'shadow-purple-500/30', to: '/admin/clientes' },
    { label: 'Ingresos', value: formatPrice(Number(stats.totalRevenue)), icon: FaDollarSign, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/30' },
    { label: 'Pedidos pendientes', value: stats.pendingOrders, icon: FaClipboardList, gradient: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/30', to: '/admin/pedidos' },
    { label: 'Reseñas por aprobar', value: stats.pendingReviews, icon: FaStar, gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/30', to: '/admin/resenas' },
    { label: 'Mensajes sin leer', value: stats.unreadMessages, icon: FaEnvelope, gradient: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/30', to: '/admin/mensajes' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <p className="text-sm text-indigo-200 capitalize">{today}</p>
          <h1 className="text-3xl lg:text-4xl font-bold mt-1">
            ¡Hola, {user?.firstName || 'Admin'}! <span className="inline-block">👋</span>
          </h1>
          <p className="text-indigo-200 mt-2 max-w-xl">
            Aquí tienes un resumen de la tienda. Todo lo que necesitas para gestionar Publidiseños Yoyer en un solo lugar.
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Wrapper: any = card.to ? Link : 'div';
          return (
            <Wrapper
              key={i}
              {...(card.to ? { to: card.to } : {})}
              className="group relative bg-white/80 backdrop-blur rounded-2xl p-6 border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Decorative gradient corner */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

              <div className="relative flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg ${card.shadow}`}>
                  <card.icon size={20} />
                </div>
                {card.to && (
                  <FaArrowRight size={12} className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                )}
              </div>
              <p className="text-3xl font-bold text-slate-800 mt-4 tracking-tight">{card.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{card.label}</p>
            </Wrapper>
          );
        })}
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-white/60 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Pedidos recientes</h2>
            <p className="text-xs text-slate-500 mt-0.5">Últimas órdenes registradas</p>
          </div>
          <Link to="/admin/pedidos" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group">
            Ver todos
            <FaArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="pb-3 font-medium">Orden</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Aún no hay pedidos
                  </td>
                </tr>
              )}
              {stats.recentOrders.map(order => (
                <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 font-medium">
                    <Link to="/admin/pedidos" className="text-primary-600 hover:underline">#{order.orderNumber}</Link>
                  </td>
                  <td className="py-3 text-slate-700">{order.user?.firstName} {order.user?.lastName}</td>
                  <td className="py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                  <td className="py-3 font-semibold text-slate-800">{formatPrice(Number(order.total))}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {translateOrderStatus(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
