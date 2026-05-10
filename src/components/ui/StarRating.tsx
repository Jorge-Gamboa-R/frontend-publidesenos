import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

/**
 * Componente de calificación con estrellas.
 * Soporta modo lectura (muestra rating) y modo interactivo (permite seleccionar).
 */
export default function StarRating({ rating, maxStars = 5, size = 18, interactive = false, onChange }: StarRatingProps) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    if (interactive) {
      stars.push(
        <button key={i} type="button" onClick={() => onChange?.(i)} className="text-yellow-400 hover:scale-110 transition-transform">
          {i <= rating ? <FaStar size={size} /> : <FaRegStar size={size} />}
        </button>
      );
    } else {
      if (rating >= i) {
        stars.push(<FaStar key={i} size={size} className="text-yellow-400" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} size={size} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} size={size} className="text-yellow-400" />);
      }
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}
