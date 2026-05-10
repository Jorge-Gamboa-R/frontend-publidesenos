import { useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import RecaptchaWidget, { isRecaptchaEnabled, type RecaptchaWidgetHandle } from '../components/ui/RecaptchaWidget';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<RecaptchaWidgetHandle>(null);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

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
      await login(email, password, token);
      toast.success('Bienvenido');
      navigate(from, { replace: true });
    } catch (err: any) {
      recaptchaRef.current?.reset();
      toast.error(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Iniciar Sesión</h1>
          <p className="text-purple-300/70 mt-2">Ingresa a tu cuenta de Publidiseños</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-purple-950/50 rounded-2xl shadow-lg border border-purple-700/30 p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">Contraseña</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/recuperar-contrasena" className="text-sm text-secondary-400 font-medium hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <RecaptchaWidget ref={recaptchaRef} />

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:from-gray-400 disabled:to-gray-400 transition-all">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-purple-700/40" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-purple-950/80 text-purple-300/60">o continúa con</span></div>
          </div>

          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/google`}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            <FaGoogle className="text-red-500" size={18} />
            Iniciar sesión con Google
          </a>
        </form>

        <p className="text-center text-sm text-purple-300/60 mt-6">
          ¿No tienes cuenta? <Link to="/registro" className="text-secondary-400 font-medium hover:underline">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
