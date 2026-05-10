import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatPrice } from '../utils/format';
import Spinner from '../components/ui/Spinner';

/**
 * Página del carrito de compras.
 */
export default function Cart() {
  const { items, isLoading, fetchCart, updateItem, removeItem, total, tax: cartTax } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <FaShoppingCart className="mx-auto text-purple-400/40 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-white mb-2">Tu carrito</h1>
        <p className="text-purple-300/60 mb-6">Inicia sesión para ver tu carrito de compras</p>
        <Link to="/login" className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  if (isLoading) return <Spinner size="lg" />;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <FaShoppingCart className="mx-auto text-purple-400/40 mb-4" size={64} />
        <h1 className="text-2xl font-bold text-white mb-2">Tu carrito está vacío</h1>
        <p className="text-purple-300/60 mb-6">Explora nuestro catálogo y encuentra algo que te guste</p>
        <Link to="/catalogo" className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700">
          Ver Catálogo
        </Link>
      </div>
    );
  }

  const subtotal = total();
  const shipping = subtotal >= 150000 ? 0 : 12000;
  const tax = cartTax();
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Tu Carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-purple-950/50 rounded-xl p-4 border border-purple-700/30 flex gap-4">
              <div className="w-24 h-24 bg-purple-900/30 rounded-lg overflow-hidden flex-shrink-0">
                {item.product.images?.[0] ? (
                  <img src={item.product.images[0].imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-400/50"><FaShoppingCart /></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link to={`/producto/${item.product.slug}`} className="font-semibold text-white hover:text-primary-400 line-clamp-1">
                  {item.product.name}
                </Link>
                {item.selectedColor && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-4 h-4 rounded-full border border-purple-700/40" style={{ backgroundColor: item.selectedColor.hexCode || undefined }} />
                    <span className="text-xs text-purple-300/60">{item.selectedColor.colorName}</span>
                  </div>
                )}
                {item.customText && <p className="text-xs text-purple-400/50 mt-1 line-clamp-1">Texto: {item.customText}</p>}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-purple-700/40 rounded">
                    <button onClick={() => {
                      if (item.quantity > 1) updateItem(item.id, { quantity: item.quantity - 1 });
                    }} className="p-2 hover:bg-purple-800/50 text-purple-200"><FaMinus size={10} /></button>
                    <span className="px-3 text-sm font-medium text-white">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })} className="p-2 hover:bg-purple-800/50 text-purple-200">
                      <FaPlus size={10} />
                    </button>
                  </div>

                  <span className="font-bold text-primary-400">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>

                  <button onClick={() => { removeItem(item.id); toast.success('Producto eliminado'); }}
                    className="p-2 text-purple-400/50 hover:text-red-500">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-white mb-4">Resumen del pedido</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-purple-300/60">Subtotal</span><span className="text-purple-100">{formatPrice(subtotal)}</span></div>
            {tax > 0 && (
              <div className="flex justify-between"><span className="text-purple-300/60">IVA</span><span className="text-purple-100">{formatPrice(tax)}</span></div>
            )}
            <div className="flex justify-between">
              <span className="text-purple-300/60">Envío</span>
              <span>{shipping === 0 ? <span className="text-green-400">Gratis</span> : <span className="text-purple-100">{formatPrice(shipping)}</span>}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-purple-400/50">Envío gratis en compras mayores a $150.000</p>
            )}
            <hr className="border-purple-800/30" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span><span className="text-primary-400">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <Link to="/checkout" className="mt-6 w-full block text-center bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 transition-all">
            Proceder al pago
          </Link>

          <Link to="/catalogo" className="mt-3 w-full block text-center text-primary-400 text-sm hover:underline">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
