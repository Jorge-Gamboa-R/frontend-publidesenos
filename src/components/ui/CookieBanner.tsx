import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCookieBite } from 'react-icons/fa';

const COOKIE_CONSENT_KEY = 'cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-[#1a0a2e] border border-purple-700/50 rounded-xl p-5 shadow-2xl shadow-purple-900/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <FaCookieBite className="text-secondary-400 flex-shrink-0 hidden sm:block" size={28} />
          <div className="flex-1">
            <p className="text-purple-100 text-sm leading-relaxed">
              Utilizamos cookies esenciales para el funcionamiento del sitio y para mejorar tu experiencia de compra.
              Al continuar navegando, aceptas el uso de cookies.{' '}
              <Link to="/politica-cookies" className="text-primary-400 hover:underline">
                Leer nuestra Política de Cookies
              </Link>
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
            <button onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 border border-purple-600/50 rounded-lg text-sm text-purple-300 hover:bg-purple-900/50 transition-colors">
              Rechazar
            </button>
            <button onClick={handleAccept}
              className="flex-1 sm:flex-none px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
