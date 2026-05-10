import { useEffect, useState } from 'react';
import { FaCheck, FaTrash, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { reviewService } from '../../services/review.service';
import StarRating from '../../components/ui/StarRating';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/format';
import type { Review } from '../../types';

/** Gestor de reseñas del admin - aprobar, filtrar y eliminar */
export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<boolean | undefined>(false);

  const fetchReviews = () => {
    setLoading(true);
    reviewService.getAll(1, filter).then(data => setReviews(data.reviews)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      await reviewService.approve(id);
      toast.success('Reseña aprobada');
      fetchReviews();
    } catch { toast.error('Error al aprobar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return;
    try {
      await reviewService.delete(id);
      toast.success('Reseña eliminada');
      fetchReviews();
    } catch { toast.error('Error al eliminar'); }
  };

  const pillClass = (active: boolean) =>
    active
      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30'
      : 'bg-white border border-amber-100 text-slate-600 hover:bg-amber-50';

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 p-6 lg:p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
            <FaStar size={20} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Reseñas</h1>
            <p className="text-orange-100 text-sm mt-0.5">Modera las opiniones que dejan tus clientes</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter(false)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pillClass(filter === false)}`}>
          Pendientes
        </button>
        <button onClick={() => setFilter(true)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pillClass(filter === true)}`}>
          Aprobadas
        </button>
        <button onClick={() => setFilter(undefined)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${pillClass(filter === undefined)}`}>
          Todas
        </button>
      </div>

      {loading ? <Spinner /> : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-amber-100/60 shadow-sm p-12 text-center">
          <div className="w-14 h-14 mx-auto bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-3">
            <FaStar size={22} />
          </div>
          <p className="text-slate-500">No hay reseñas en esta vista</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-amber-100/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md shadow-purple-500/20">
                      {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{review.user?.firstName} {review.user?.lastName}</p>
                      <span className="text-xs text-slate-400">{review.user?.email}</span>
                    </div>
                    {review.isApproved ? (
                      <span className="ml-auto px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                        ✓ Aprobada
                      </span>
                    ) : (
                      <span className="ml-auto px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-pink-600 mb-2 font-semibold">Producto: {review.product?.name}</p>
                  <StarRating rating={review.rating} size={16} />
                  {review.comment && <p className="mt-2 text-slate-600 text-sm leading-relaxed">{review.comment}</p>}
                  <p className="text-xs text-slate-400 mt-2">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!review.isApproved && (
                    <button onClick={() => handleApprove(review.id)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="Aprobar">
                      <FaCheck />
                    </button>
                  )}
                  <button onClick={() => handleDelete(review.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors" title="Eliminar">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
