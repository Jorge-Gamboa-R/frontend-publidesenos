import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export interface Slide {
  id: number;
  type: 'image' | 'video';
  src: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  overlay?: boolean;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1,
    type: 'image',
    src: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1400&h=600&fit=crop',
    title: 'Tu imaginación, nuestro diseño',
    subtitle: 'Camisetas, gorras, mugs y más con personalización total',
    buttonText: 'Ver Catálogo',
    buttonLink: '/catalogo',
    overlay: true,
  },
  {
    id: 2,
    type: 'image',
    src: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1400&h=600&fit=crop',
    title: 'Productos personalizados',
    subtitle: 'Dale vida a tus ideas con diseños únicos de alta calidad',
    overlay: true,
  },
  {
    id: 3,
    type: 'image',
    src: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1400&h=600&fit=crop',
    title: 'Envío a toda Colombia',
    subtitle: 'Gratis en compras mayores a $150.000',
    buttonText: 'Comprar ahora',
    buttonLink: '/carrito',
    overlay: true,
  },
  {
    id: 4,
    type: 'image',
    src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1400&h=600&fit=crop',
    title: 'Diseño publicitario profesional',
    subtitle: 'Contáctanos y hagamos realidad tu proyecto',
    buttonText: 'Contáctanos',
    buttonLink: '/contacto',
    overlay: true,
  },
];

interface HeroSliderProps {
  slides?: Slide[];
  autoPlayInterval?: number;
}

export default function HeroSlider({ slides = DEFAULT_SLIDES, autoPlayInterval = 5000 }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPlaying, next, autoPlayInterval]);

  // Pause on hover
  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next]);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden"
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>

      {/* Slides */}
      {slides.map((s, i) => (
        <div key={s.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === current ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-105 pointer-events-none'}`}
          aria-hidden={i !== current}>

          {s.type === 'video' ? (
            <div className="relative w-full h-full">
              <video src={s.src} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            </div>
          ) : (
            <img src={s.src} alt={s.title || ''} className="w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
          )}

          {/* Overlay */}
          {s.overlay && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a2e]/90 via-[#1a0a2e]/60 to-transparent" />
          )}

          {/* Content */}
          {(s.title || s.subtitle) && (
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 sm:px-8 w-full">
                <div className={`max-w-xl transition-all duration-700 delay-200 ${i === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  {s.title && (
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
                      {s.title}
                    </h2>
                  )}
                  {s.subtitle && (
                    <p className="mt-4 text-lg md:text-xl text-slate-200 drop-shadow-md">
                      {s.subtitle}
                    </p>
                  )}
                  {s.buttonText && s.buttonLink && (
                    <Link to={s.buttonLink}
                      className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white px-8 py-3 rounded-full font-bold hover:from-primary-700 hover:to-secondary-600 transition-all shadow-lg">
                      {s.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Navigation arrows */}
      <button onClick={prev} aria-label="Anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors z-10">
        <FaChevronLeft size={18} />
      </button>
      <button onClick={next} aria-label="Siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors z-10">
        <FaChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} aria-label={`Ir a slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-3 bg-primary-500' : 'w-3 h-3 bg-white/40 hover:bg-white/60'}`} />
        ))}
      </div>

      {/* Progress bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-10">
          <div className="h-full bg-primary-500 transition-none"
            style={{
              animation: `sliderProgress ${autoPlayInterval}ms linear`,
              animationIterationCount: 1,
              width: '100%'
            }}
            key={current} />
        </div>
      )}

      <style>{`
        @keyframes sliderProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
