import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authService } from '../services/auth.service';
import RecaptchaWidget, { isRecaptchaEnabled, type RecaptchaWidgetHandle } from '../components/ui/RecaptchaWidget';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const recaptchaRef = useRef<RecaptchaWidgetHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let token: string | null = null;
      if (isRecaptchaEnabled()) {
        token = (await recaptchaRef.current?.executeAsync()) ?? null;
        if (!token) {
          toast.error('Verificación reCAPTCHA fallida');
          setLoading(false);
          return;
        }
      }
      await authService.forgotPassword(email, token);
      setSent(true);
      toast.success('Solicitud enviada');
    } catch {
      recaptchaRef.current?.reset();
      toast.error('Error al enviar solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Recuperar Contraseña</h1>
          <p className="text-slate-400 mt-2">Te enviaremos instrucciones para restablecer tu contraseña</p>
        </div>

        {sent ? (
          <div className="bg-slate-800/80 rounded-2xl shadow-lg border border-slate-700 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-green-600" size={28} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Revisa tu correo</h2>
            <p className="text-slate-400 text-sm mb-6">
              Si el email <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña. El enlace expira en 1 hora.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              (En desarrollo: revisa la consola del servidor para obtener el enlace)
            </p>
            <Link to="/login" className="text-primary-600 font-medium hover:underline text-sm">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-800/80 rounded-2xl shadow-lg border border-slate-700 p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="tu@email.com" />
            </div>

            <RecaptchaWidget ref={recaptchaRef} />

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 transition-colors">
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
        )}

        <p className="text-center mt-6">
          <Link to="/login" className="text-sm text-slate-400 hover:text-primary-600 flex items-center justify-center gap-2">
            <FaArrowLeft size={12} /> Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
