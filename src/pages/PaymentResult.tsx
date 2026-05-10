import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import Spinner from '../components/ui/Spinner';
import { paymentService } from '../services/payment.service';
import { useCartStore } from '../store/cartStore';

type Status = 'completed' | 'failed' | 'processing' | 'pending';

export default function PaymentResult() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchCart } = useCartStore();

  useEffect(() => {
    // El backend ya vació el carrito al crear la orden, pero si el usuario llega
    // aquí con el store desactualizado, sincronizamos para que el contador baje.
    fetchCart();
    if (!orderId) {
      setLoading(false);
      return;
    }
    let attempts = 0;
    const MAX = 10;
    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        // verify consulta Wompi directamente (no depende del webhook,
        // que no puede alcanzar localhost en dev).
        const r = await paymentService.verify(orderId);
        if (cancelled) return;
        setStatus(r.status as Status);
        const done = r.status === 'completed' || r.status === 'failed';
        if (r.status === 'completed') {
          // Refresca otra vez por si el carrito quedó desincronizado.
          fetchCart();
        }
        if (!done && attempts < MAX) {
          attempts += 1;
          setTimeout(poll, 3000);
        } else {
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Spinner />
        <p className="text-purple-300/70 mt-4">Confirmando tu pago...</p>
      </div>
    );
  }

  const ui = {
    completed: {
      icon: <FaCheckCircle className="text-green-400" size={72} />,
      title: '¡Pago aprobado!',
      message: 'Tu pedido ha sido confirmado. Te enviaremos un correo con los detalles.',
    },
    failed: {
      icon: <FaTimesCircle className="text-red-400" size={72} />,
      title: 'Pago no completado',
      message: 'El pago no se pudo procesar. Puedes intentarlo de nuevo desde tus pedidos.',
    },
    processing: {
      icon: <FaClock className="text-yellow-400" size={72} />,
      title: 'Pago en proceso',
      message: 'Tu pago aún se está procesando. Te notificaremos cuando se confirme.',
    },
    pending: {
      icon: <FaClock className="text-yellow-400" size={72} />,
      title: 'Pago pendiente',
      message: 'Estamos esperando la confirmación de Wompi.',
    },
  }[status || 'pending'];

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">{ui.icon}</div>
      <h1 className="text-3xl font-bold text-white mb-3">{ui.title}</h1>
      <p className="text-purple-300/70 mb-8">{ui.message}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link
            to={`/mi-cuenta/pedidos/${orderId}`}
            className="bg-primary-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-700 transition-colors"
          >
            Ver mi pedido
          </Link>
        )}
        <Link
          to="/catalogo"
          className="bg-purple-900/50 text-purple-100 px-6 py-3 rounded-full font-semibold hover:bg-purple-800/50 transition-colors border border-purple-700/40"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
