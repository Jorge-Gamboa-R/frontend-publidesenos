import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';
import StarRating from './StarRating';
import { reviewService } from '../../services/review.service';

interface ReviewModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function ReviewModal({ productId, productName, onClose, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Selecciona una calificación');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.create({ productId, rating, comment: comment.trim() || undefined });
      toast.success('¡Gracias! Tu reseña fue enviada y será publicada tras aprobación.');
      onSubmitted?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al enviar la reseña';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Calificar producto</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500" aria-label="Cerrar">
            <FaTimes />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4 truncate">{productName}</p>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tu calificación</label>
          <div className="mb-4">
            <StarRating rating={rating} size={28} interactive onChange={setRating} />
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">Comentario (opcional)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Comparte tu experiencia con el producto..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{comment.length}/500</p>

          <div className="flex justify-end gap-2 mt-5">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {submitting ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
