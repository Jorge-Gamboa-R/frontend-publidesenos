import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowRight, FaTruck, FaShieldAlt, FaPalette, FaWhatsapp } from 'react-icons/fa';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/ui/Spinner';
import HeroSlider from '../components/ui/HeroSlider';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { useWishlist } from '../hooks/useWishlist';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import type { Product, Category } from '../types';

/**
 * Página principal - Hero, productos destacados, categorías, beneficios
 */
export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggle, isWishlisted } = useWishlist();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash, categories.length]);

  const loadData = () => {
    Promise.all([
      productService.getFeatured(),
      categoryService.getAll(),
    ]).then(([products, cats]) => {
      setFeatured(products);
      setCategories(cats);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);
  useRefreshOnFocus(loadData);

  return (
    <div>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Beneficios */}
      <section className="bg-purple-950/40 py-12 border-y border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary-500/20 rounded-full text-secondary-400"><FaTruck size={24} /></div>
              <div>
                <h3 className="font-semibold text-white">Envío a todo Colombia</h3>
                <p className="text-sm text-purple-300/60">Gratis en compras mayores a $150.000</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-600/20 rounded-full text-primary-400"><FaShieldAlt size={24} /></div>
              <div>
                <h3 className="font-semibold text-white">Compra segura</h3>
                <p className="text-sm text-purple-300/60">Pago protegido con Wompi</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-500/20 rounded-full text-accent-400"><FaPalette size={24} /></div>
              <div>
                <h3 className="font-semibold text-white">Personalización total</h3>
                <p className="text-sm text-purple-300/60">Texto, imágenes y colores a tu gusto</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section id="categorias" className="py-16 scroll-mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Nuestras Categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(cat => {
                const thumb = cat.imageUrl || cat.products?.[0]?.images?.[0]?.imageUrl;
                return (
                  <Link key={cat.id} to={`/catalogo/${cat.slug}`}
                    className="group bg-purple-950/50 rounded-xl p-6 text-center hover:bg-purple-900/50 transition-all border border-purple-700/30 hover:border-secondary-500/50">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gradient-to-br from-primary-600/20 to-secondary-500/20 flex items-center justify-center text-primary-400 group-hover:text-secondary-400 transition-colors border border-purple-700/30">
                      {thumb ? (
                        <img src={thumb} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <FaPalette size={24} />
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
                    {cat._count && (
                      <p className="text-xs text-purple-300/60 mt-1">{cat._count.products} productos</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Productos Destacados */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-white">Productos Destacados</h2>
            <Link to="/catalogo" className="text-primary-400 font-medium hover:underline flex items-center gap-1">
              Ver todos <FaArrowRight size={12} />
            </Link>
          </div>

          {loading ? <Spinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} isWishlisted={isWishlisted(product.id)} onToggleWishlist={toggle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Tienes un diseño en mente?</h2>
          <p className="text-purple-100 text-lg mb-8">
            Contáctanos por WhatsApp y te ayudamos a hacerlo realidad
          </p>
          <a href="https://wa.me/573502362979" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-green-600 transition-colors">
            <FaWhatsapp size={24} /> Escribir por WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
