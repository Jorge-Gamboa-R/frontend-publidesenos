import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaHeart, FaUser, FaMapMarkerAlt, FaStar, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import type { UserStats } from '../../types';

const formatCop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const formatMonth = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
};

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    authService.getMyStats().then(setStats).catch(() => undefined);
  }, []);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      toast.success('Correo de verificación enviado');
    } catch {
      toast.error('No se pudo reenviar el correo');
    } finally {
      setResending(false);
    }
  };

  const links = [
    { to: '/mi-cuenta/pedidos', icon: FaClipboardList, label: 'Mis Pedidos', desc: 'Revisa el estado de tus compras' },
    { to: '/lista-deseos', icon: FaHeart, label: 'Lista de Deseos', desc: 'Productos que te gustan' },
    { to: '/mi-cuenta/perfil', icon: FaUser, label: 'Mi Perfil', desc: 'Edita tu información personal' },
    { to: '/mi-cuenta/direcciones', icon: FaMapMarkerAlt, label: 'Direcciones', desc: 'Gestiona tus direcciones de envío' },
  ];

  const statCards = [
    { label: 'Pedidos', value: stats?.totalOrders ?? '—', icon: FaClipboardList },
    { label: 'Total gastado', value: stats ? formatCop(stats.totalSpent) : '—', icon: FaStar },
    { label: 'Favoritos', value: stats?.wishlistCount ?? '—', icon: FaHeart },
    { label: 'Reseñas', value: stats?.reviewsCount ?? '—', icon: FaStar },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header card */}
      <section className="bg-gradient-to-br from-purple-950/70 to-purple-900/40 rounded-2xl p-6 border border-purple-700/30 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.firstName}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-500/50" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center text-3xl font-bold border-4 border-primary-500/50">
                {initials || '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Hola, {user?.firstName}!</h1>
              {user?.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">
                  <FaCheckCircle size={12} /> Verificado
                </span>
              ) : (
                <button onClick={handleResend} disabled={resending}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 hover:bg-yellow-500/30 disabled:opacity-50">
                  <FaExclamationCircle size={12} />
                  {resending ? 'Enviando...' : 'Verificar correo'}
                </button>
              )}
            </div>
            <p className="text-purple-300/70 truncate">{user?.email}</p>
            <p className="text-purple-300/50 text-sm mt-1">
              Miembro desde {formatMonth(stats?.memberSince ?? user?.createdAt ?? null)}
            </p>
          </div>
          <Link to="/mi-cuenta/perfil"
            className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap">
            Editar perfil
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-purple-950/50 rounded-xl p-4 border border-purple-700/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-purple-300/60 uppercase tracking-wide">{s.label}</span>
              <s.icon className="text-primary-400" size={16} />
            </div>
            <div className="text-2xl font-bold text-white truncate">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map(link => (
          <Link key={link.to} to={link.to}
            className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30 hover:border-primary-500/50 transition-all group">
            <link.icon className="text-primary-400 mb-3" size={24} />
            <h3 className="font-semibold text-white group-hover:text-primary-400">{link.label}</h3>
            <p className="text-sm text-purple-300/60 mt-1">{link.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
