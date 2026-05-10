import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaClipboardList, FaStar, FaEnvelope, FaCog, FaArrowLeft, FaChartBar, FaUsers, FaTags } from 'react-icons/fa';

const adminLinks = [
  { to: '/admin', icon: FaChartBar, label: 'Panel', exact: true },
  { to: '/admin/clientes', icon: FaUsers, label: 'Clientes' },
  { to: '/admin/categorias', icon: FaTags, label: 'Categorías' },
  { to: '/admin/productos', icon: FaBox, label: 'Productos' },
  { to: '/admin/pedidos', icon: FaClipboardList, label: 'Pedidos' },
  { to: '/admin/resenas', icon: FaStar, label: 'Reseñas' },
  { to: '/admin/mensajes', icon: FaEnvelope, label: 'Mensajes' },
  { to: '/admin/configuracion', icon: FaCog, label: 'Configuración' },
];

/** Layout del panel de administración con sidebar */
export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white flex-shrink-0 hidden lg:flex flex-col shadow-2xl relative">
        {/* Decorative blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 border-b border-white/10 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/30">
              PY
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Panel Admin</h2>
              <p className="text-[11px] text-slate-400">Publidiseños Yoyer</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 relative">
          {adminLinks.map(link => {
            const isActive = link.exact
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <link.icon size={16} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                {link.label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
              </Link>
            );
          })}

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <FaArrowLeft size={16} />
            Volver a la tienda
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-xs">
              PY
            </div>
            <h2 className="font-bold">Panel Admin</h2>
          </div>
          <Link to="/" className="text-sm text-slate-300 flex items-center gap-1 hover:text-white">
            <FaHome size={14} /> Tienda
          </Link>
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden bg-white/80 backdrop-blur border-b border-slate-200 overflow-x-auto">
          <div className="flex gap-1 p-2">
            {adminLinks.map(link => {
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <link.icon size={12} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
