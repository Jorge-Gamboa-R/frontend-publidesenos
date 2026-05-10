import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaMinus, FaPlus, FaWhatsapp, FaMagic, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import StarRating from '../components/ui/StarRating';
import Spinner from '../components/ui/Spinner';
import { productService } from '../services/product.service';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlist } from '../hooks/useWishlist';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { formatPrice, formatDate } from '../utils/format';
import type { Product } from '../types';

/**
 * Página de detalle de producto con galería, personalización, reseñas y agregar al carrito.
 */
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { toggle, isWishlisted } = useWishlist();

  const loadProduct = () => {
    if (!slug) return;
    setLoading(true);
    productService.getBySlug(slug)
      .then(setProduct)
      .catch(() => toast.error('Producto no encontrado'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProduct(); }, [slug]);
  useRefreshOnFocus(loadProduct);

  const isCustomizable = !!product && (product.allowsColorSelection || product.allowsImageUpload || product.allowsText);

  const handleSimpleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Inicia sesión para agregar al carrito');
      return;
    }
    try {
      await addItem({ productId: product.id, quantity });
      toast.success('Producto agregado al carrito');
    } catch {
      toast.error('Error al agregar al carrito');
    }
  };

  const handleCustomizeClick = () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Inicia sesión para personalizar y comprar');
      return;
    }
    window.open(`/personalizar/${product.slug}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <Spinner size="lg" />;
  if (!product) return <div className="text-center py-20 text-slate-400">Producto no encontrado</div>;

  const images = product.images || [];
  const videos = product.videos || [];
  const media: Array<{ kind: 'image' | 'video'; url: string; thumb: string; alt?: string }> = [
    ...images.map(i => ({ kind: 'image' as const, url: i.imageUrl, thumb: i.imageUrl, alt: i.altText })),
    ...videos.map(v => ({ kind: 'video' as const, url: v.videoUrl, thumb: v.thumbnailUrl || v.videoUrl, alt: v.title })),
  ];
  const currentMedia = media[selectedMedia];
  const hasDiscount = product.discountPrice && product.discountPrice < product.basePrice;
  const finalPrice = Number(product.discountPrice || product.basePrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-purple-300/70 mb-6">
        <Link to="/" className="hover:text-primary-400">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/catalogo" className="hover:text-primary-400">Catálogo</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link to={`/catalogo/${product.category.slug}`} className="hover:text-primary-400">{product.category.name}</Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Galería */}
        <div>
          <div className={`relative ${currentMedia?.kind === 'video' ? 'aspect-[9/16] max-h-[75vh] mx-auto' : 'aspect-square'} bg-purple-950/50 rounded-xl overflow-hidden mb-4`}>
            {currentMedia ? (
              currentMedia.kind === 'video' ? (
                <video src={currentMedia.url} controls autoPlay muted loop playsInline className="w-full h-full object-contain" />
              ) : (
                <img src={currentMedia.url} alt={currentMedia.alt || product.name} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <FaShoppingCart size={64} />
              </div>
            )}
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedMedia(i => (i - 1 + media.length) % media.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors z-10"
                  aria-label="Imagen anterior"
                >
                  <FaChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMedia(i => (i + 1) % media.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors z-10"
                  aria-label="Imagen siguiente"
                >
                  <FaChevronRight size={16} />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none">
                  {selectedMedia + 1} / {media.length}
                </span>
              </>
            )}
          </div>
          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {media.map((m, i) => (
                <button key={`${m.kind}-${i}`} onClick={() => setSelectedMedia(i)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedMedia ? 'border-primary-600' : 'border-transparent'}`}>
                  {m.kind === 'video' ? (
                    <>
                      <video src={m.url} className="w-full h-full object-cover" muted />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold">▶</span>
                    </>
                  ) : (
                    <img src={m.thumb} alt="" className="w-full h-full object-cover" />
                  )}
                  <span className={`absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none ${i === selectedMedia ? 'bg-primary-600 text-white' : 'bg-black/60 text-white'}`}>
                    {i + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link to={`/catalogo/${product.category.slug}`} className="text-sm text-secondary-400 font-medium uppercase tracking-wide">
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold text-white mt-2">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <StarRating rating={Number(product.avgRating)} />
            <span className="text-sm text-purple-300/60">({product.reviewCount} reseñas)</span>
          </div>

          <div className="mt-4">
            {hasDiscount ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-secondary-400">{formatPrice(finalPrice)}</span>
                <span className="text-xl text-purple-400/50 line-through">{formatPrice(Number(product.basePrice))}</span>
                <span className="bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded">
                  -{Math.round((1 - finalPrice / Number(product.basePrice)) * 100)}%
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-secondary-400">{formatPrice(finalPrice)}</span>
            )}
          </div>

          <p className="mt-4 text-purple-200/80 leading-relaxed">{product.description || product.shortDescription}</p>

          {/* Stock */}
          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">En stock ({product.stock} disponibles)</span>
            ) : (
              <span className="text-red-500 font-medium">Agotado</span>
            )}
          </div>

          {/* Cantidad y acción principal */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-purple-700/40 rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-purple-800/50 text-purple-200">
                <FaMinus size={12} />
              </button>
              <span className="px-4 font-medium text-white">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-purple-800/50 text-purple-200">
                <FaPlus size={12} />
              </button>
            </div>

            {isCustomizable ? (
              <button onClick={handleCustomizeClick} disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg shadow-secondary-500/20">
                <FaMagic /> Personalizar este producto
              </button>
            ) : (
              <button onClick={handleSimpleAddToCart} disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">
                <FaShoppingCart /> Agregar al Carrito
              </button>
            )}

            <button onClick={() => toggle(product.id)}
              className={`p-3 border border-purple-700/40 rounded-lg hover:bg-purple-800/50 transition-colors ${isWishlisted(product.id) ? 'text-red-500' : 'text-purple-300/60 hover:text-red-500'}`}>
              <FaHeart size={20} />
            </button>
          </div>

          {/* WhatsApp */}
          <a href={`https://wa.me/573502362979?text=Hola, me interesa el producto: ${product.name}`}
            target="_blank" rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
            <FaWhatsapp size={20} /> Consultar por WhatsApp
          </a>

          <p className="mt-4 text-xs text-purple-400/50">SKU: {product.sku}</p>
        </div>
      </div>

      {/* Reseñas */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Opiniones de clientes</h2>
          <div className="space-y-6">
            {product.reviews.map(review => (
              <div key={review.id} className="bg-purple-950/50 p-6 rounded-xl border border-purple-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {review.user?.firstName?.[0]}{review.user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white">{review.user?.firstName} {review.user?.lastName}</p>
                    <p className="text-xs text-purple-400/50">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <StarRating rating={review.rating} size={16} />
                {review.comment && <p className="mt-3 text-purple-200/80 text-sm">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
