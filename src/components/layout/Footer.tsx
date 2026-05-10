import { Link } from 'react-router-dom';
import { FaInstagram, FaTiktok, FaFacebook, FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';

/**
 * Footer de la aplicación con enlaces, redes sociales e información de contacto.
 */
export default function Footer() {
  return (
    <footer className="bg-[#130826] text-purple-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Brand + Redes sociales */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-8 border-b border-purple-800/30">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img src="/logo.png" alt="Publidiseños Yoyer" className="h-14 w-auto hover:opacity-80 transition-opacity" />
            </Link>
            <div>
              <h3 className="text-xl font-bold text-white">Publidiseños Yoyer</h3>
              <p className="text-sm text-purple-300/70 max-w-md">
                Tu imaginación, nuestro diseño.<br />
                Productos personalizados de alta calidad para eventos,<br />
                empresas y uso personal.
              </p>
            </div>
          </div>
          <div className="sm:ml-auto">
            <h3 className="text-xl font-bold text-white mb-3">Nuestras Redes Sociales</h3>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/publidisenosyoyer/" target="_blank" rel="noopener noreferrer" className="p-2 bg-purple-900/50 rounded-full hover:bg-gradient-to-r hover:from-purple-600 hover:to-secondary-500 transition-all">
                <FaInstagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@publidisenosyoyer" target="_blank" rel="noopener noreferrer" className="p-2 bg-purple-900/50 rounded-full hover:bg-primary-600 transition-colors">
                <FaTiktok size={20} />
              </a>
              <a href="https://www.facebook.com/share/1ET7v2Q8m4/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="p-2 bg-purple-900/50 rounded-full hover:bg-blue-600 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="https://wa.me/573502362979" target="_blank" rel="noopener noreferrer" className="p-2 bg-purple-900/50 rounded-full hover:bg-green-600 transition-colors">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Navegación */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-purple-300/70">
              <li><Link to="/" className="hover:text-secondary-400 transition-colors">Inicio</Link></li>
              <li><Link to="/catalogo" className="hover:text-secondary-400 transition-colors">Catálogo</Link></li>
              <li><Link to="/nosotros" className="hover:text-secondary-400 transition-colors">Nosotros</Link></li>
              <li><Link to="/contacto" className="hover:text-secondary-400 transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-purple-300/70">
              <li className="flex items-center gap-2">
                <FaPhone size={14} className="text-secondary-400" />
                <span>350 236 2979</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope size={14} className="text-secondary-400" />
                <span>publidisenosyoyer@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <FaWhatsapp size={14} className="text-green-400" />
                <a href="https://wa.me/573502362979" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-400 transition-colors">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-purple-300/70">
              <li><Link to="/politica-privacidad" className="hover:text-secondary-400 transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/terminos-condiciones" className="hover:text-secondary-400 transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/politica-devoluciones" className="hover:text-secondary-400 transition-colors">Devoluciones y Cambios</Link></li>
              <li><Link to="/politica-cookies" className="hover:text-secondary-400 transition-colors">Política de Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-purple-800/30 text-center text-sm text-purple-400/50">
          <p>&copy; {new Date().getFullYear()} Publidiseños Yoyer. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
