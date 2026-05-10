import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaUser, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

/**
 * Header principal de la aplicación.
 * Incluye logo, navegación, búsqueda, carrito y menú de usuario.
 */
export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore(s => s.itemCount);
  const wishlistCount = useWishlistStore(s => s.count);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sincroniza el input con la búsqueda activa en la URL
  useEffect(() => {
    const urlSearch = new URLSearchParams(location.search).get('search') || '';
    if (location.pathname.startsWith('/catalogo')) {
      setSearchQuery(urlSearch);
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/catalogo?search=${encodeURIComponent(q)}`);
    } else if (location.pathname.startsWith('/catalogo')) {
      navigate('/catalogo');
    }
    setMenuOpen(false);
  };

  return (
    <header className="bg-[#1a0a2e]/95 backdrop-blur-md border-b border-purple-800/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar - solo móvil */}
        <div className="flex items-center justify-between h-16 md:hidden">
          {/* Logo - visible solo en móvil arriba */}
          <Link to="/" className="flex items-center gap-2 md:hidden">
            <img src="/logo.png" alt="Publidiseños Yoyer" className="h-12 w-auto" />
          </Link>

          {/* Mobile actions only */}
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/carrito" className="p-2 text-slate-300 hover:text-primary-400 transition-colors relative">
              <FaShoppingCart size={20} />
              {itemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount()}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link to="/mi-cuenta" className="p-2 text-slate-300 hover:text-primary-400">
                <FaUser size={18} />
              </Link>
            ) : (
              <Link to="/login" className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors">
                Ingresar
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-300">
              {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation + Search */}
        <nav className="hidden md:flex items-center gap-8 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Publidiseños Yoyer" className="h-14 w-auto" />
          </Link>
          <Link to="/" className="text-slate-300 hover:text-primary-400 font-semibold text-base transition-colors">Inicio</Link>
          <Link to="/categorias" className="text-slate-300 hover:text-primary-400 font-semibold text-base transition-colors">Categorías</Link>
          <Link to="/catalogo" className="text-slate-300 hover:text-primary-400 font-semibold text-base transition-colors">Catálogo</Link>
          <Link to="/nosotros" className="text-slate-300 hover:text-primary-400 font-semibold text-base transition-colors">Nosotros</Link>
          <Link to="/contacto" className="text-slate-300 hover:text-primary-400 font-semibold text-base transition-colors">Contacto</Link>

          <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-sm ml-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-4 pr-10 py-2 bg-purple-950/50 border border-purple-700/40 rounded-full text-sm text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-400">
                <FaSearch />
              </button>
            </div>
          </form>

          {/* Actions desktop */}
          <div className="flex items-center gap-3 ml-4">
            {isAuthenticated && (
              <Link to="/lista-deseos" className="p-2 text-slate-300 hover:text-primary-400 transition-colors relative">
                <FaHeart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            <Link to="/carrito" className="p-2 text-slate-300 hover:text-primary-400 transition-colors relative">
              <FaShoppingCart size={20} />
              {itemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount()}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 text-slate-300 hover:text-primary-400">
                  <FaUser size={18} />
                  <span className="text-sm font-medium">{user?.firstName}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#2d1b4e] border border-purple-700/40 rounded-lg shadow-lg py-1 z-50">
                    <Link to="/mi-cuenta" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-purple-200 hover:bg-purple-800/50">Mi Cuenta</Link>
                    <Link to="/mi-cuenta/pedidos" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-purple-200 hover:bg-purple-800/50">Mis Pedidos</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-secondary-400 font-medium hover:bg-purple-800/50">Panel Admin</Link>
                    )}
                    <hr className="my-1 border-purple-700/40" />
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-purple-800/50">
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors">
                Ingresar
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1a0a2e] border-t border-purple-800/30 px-4 pb-4">
          <form onSubmit={handleSearch} className="mt-3 mb-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-4 pr-10 py-2 bg-purple-950/50 border border-purple-700/40 rounded-full text-sm text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <FaSearch />
              </button>
            </div>
          </form>
          <nav className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium">Inicio</Link>
            <Link to="/categorias" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium">Categorías</Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium">Catálogo</Link>
            <Link to="/nosotros" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium">Nosotros</Link>
            <Link to="/contacto" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium">Contacto</Link>
            {isAuthenticated && (
              <Link to="/lista-deseos" onClick={() => setMenuOpen(false)} className="text-slate-300 font-medium">Lista de Deseos</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
