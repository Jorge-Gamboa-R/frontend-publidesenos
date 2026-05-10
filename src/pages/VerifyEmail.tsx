import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const { fetchUser } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado');
      return;
    }
    authService.verifyEmail(token)
      .then(() => {
        setStatus('ok');
        setMessage('Tu correo fue verificado correctamente.');
        fetchUser().catch(() => undefined);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'No se pudo verificar el correo');
      });
  }, [params, fetchUser]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="bg-purple-950/50 rounded-2xl p-8 border border-purple-700/30 max-w-md w-full text-center">
        {status === 'loading' && (
          <p className="text-purple-200">Verificando tu correo...</p>
        )}
        {status === 'ok' && (
          <>
            <FaCheckCircle className="text-green-400 mx-auto mb-3" size={48} />
            <h1 className="text-2xl font-bold text-white mb-2">¡Correo verificado!</h1>
            <p className="text-purple-300/70 mb-6">{message}</p>
            <Link to="/mi-cuenta" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium">
              Ir a mi cuenta
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <FaTimesCircle className="text-red-400 mx-auto mb-3" size={48} />
            <h1 className="text-2xl font-bold text-white mb-2">No se pudo verificar</h1>
            <p className="text-purple-300/70 mb-6">{message}</p>
            <Link to="/mi-cuenta/perfil" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium">
              Reenviar desde mi perfil
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
