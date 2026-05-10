import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import Spinner from '../components/ui/Spinner';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useAuthStore();
  // El código de canje es single-use; en StrictMode el efecto corre dos veces
  // y la segunda recibiría 401. Este ref garantiza una única llamada.
  const exchangedRef = useRef(false);

  useEffect(() => {
    if (exchangedRef.current) return;
    exchangedRef.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Error al iniciar sesión con Google');
      navigate('/login', { replace: true });
      return;
    }

    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    authService
      .googleExchange(code)
      .then(({ user, accessToken }) => {
        setAccessToken(accessToken);
        setUser(user);
        toast.success('Bienvenido');
        navigate('/', { replace: true });
      })
      .catch(() => {
        toast.error('No se pudo completar el inicio de sesión');
        navigate('/login', { replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-slate-400 mt-4">Iniciando sesión con Google...</p>
      </div>
    </div>
  );
}
