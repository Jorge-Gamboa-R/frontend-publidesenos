import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa';
import StarRating from '../ui/StarRating';
import { formatPrice } from '../../utils/format';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

/**
 * Tarjeta de producto para catálogo y secciones destacadas.
 * Muestra imagen, nombre, precio, rating y botones de acción.
 */
export default function ProductCard({ product, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const hasDiscount = product.discountPrice && product.discountPrice < product.basePrice;

  return (
    <div className="group bg-purple-950/50 rounded-xl shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 overflow-hidden border border-purple-700/30 hover:border-primary-500/40">
      {/* Imagen */}
      <Link to={`/producto/${product.slug}`} className="block relative overflow-hidden aspect-square bg-purple-900/30">
        {primaryImage ? (
          <img
            src={primaryImage.imageUrl}
            alt={primaryImage.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FaShoppingCart size={48} />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round((1 - Number(product.discountPrice) / Number(product.basePrice)) * 100)}%
          </span>
        )}

        {onToggleWishlist && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleWishlist(product.id); }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
          >
            {isWishlisted ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-400" />}
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.category && (
          <Link to={`/catalogo/${product.category.slug}`} className="text-xs text-primary-400 font-medium uppercase tracking-wide hover:underline">
            {product.category.name}
          </Link>
        )}

        <Link to={`/producto/${product.slug}`}>
          <h3 className="mt-1 font-semibold text-white line-clamp-2 hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={Number(product.avgRating)} size={14} />
          <span className="text-xs text-purple-300/60">({product.reviewCount})</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-secondary-400">{formatPrice(Number(product.discountPrice))}</span>
                <span className="text-sm text-purple-400/50 line-through">{formatPrice(Number(product.basePrice))}</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-secondary-400">{formatPrice(Number(product.basePrice))}</span>
            )}
          </div>

          {product.stock > 0 ? (
            <span className="text-xs text-green-400 font-medium">En stock</span>
          ) : (
            <span className="text-xs text-red-400 font-medium">Agotado</span>
          )}
        </div>
      </div>
    </div>
  );
}
