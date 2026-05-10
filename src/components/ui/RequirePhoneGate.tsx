import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaPhoneAlt } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';

const PUBLIC_PATHS = [
  '/login',
  '/registro',
  '/recuperar-contrasena',
  '/restablecer-contrasena',
  '/auth/google/callback',
];

/**
 * Modal bloqueante que obliga a clientes autenticados sin número de celular
 * a registrarlo antes de seguir navegando.
 */
export default function RequirePhoneGate() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const onAuthRoute = PUBLIC_PATHS.some(p => location.pathname.startsWith(p));
  const phoneDigits = (user?.phone || '').replace(/\D/g, '');
  const needsPhone =
    isAuthenticated &&
    user &&
    user.role === 'customer' &&
    phoneDigits.length < 7 &&
    !onAuthRoute;

  useEffect(() => {
    if (needsPhone) setPhone('');
  }, [needsPhone]);

  if (!needsPhone) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      toast.error('Ingresa un número de celular válido');
      return;
    }
    setSaving(true);
    try {
      const updated = await authService.updateProfile({ phone });
      setUser(updated);
      toast.success('Celular guardado');
    } catch {
      toast.error('No se pudo guardar el celular');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-purple-950 border border-purple-700/50 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg">
            <FaPhoneAlt size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Completa tu perfil</h2>
            <p className="text-xs text-purple-300/70">Necesitamos tu número de celular</p>
          </div>
        </div>

        <p className="text-sm text-purple-200/80 mb-5">
          Para continuar usando tu cuenta, registra un número de celular. Lo usaremos para
          coordinar tus pedidos y mantenerte informado.
        </p>

        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="tel"
            inputMode="tel"
            pattern="[0-9+\-\s()]{7,20}"
            placeholder="Ej: 3001234567"
            required
            autoFocus
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/40 rounded-lg focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
