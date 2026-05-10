import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { toBlob } from 'html-to-image';
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaCheck,
  FaShoppingCart,
  FaTrash,
} from 'react-icons/fa';
import { productService } from '../services/product.service';
import { uploadService } from '../services/upload.service';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import Spinner from '../components/ui/Spinner';
import MugTemplate from '../components/customizer/MugTemplate';
import type { Product, ProductColor } from '../types';

const MAX_IMAGE_MB = 15;
const MAX_IMAGES = 3;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Sans (Inter)', value: "'Inter', system-ui, sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Oswald', value: "'Oswald', sans-serif" },
  { label: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Roboto Slab', value: "'Roboto Slab', serif" },
  { label: 'Dancing Script', value: "'Dancing Script', cursive" },
  { label: 'Pacifico', value: "'Pacifico', cursive" },
  { label: 'Lobster', value: "'Lobster', cursive" },
  { label: 'Satisfy', value: "'Satisfy', cursive" },
  { label: 'Permanent Marker', value: "'Permanent Marker', cursive" },
];

type TextOrientation =
  | { kind: 'rotate'; deg: number }
  | { kind: 'stack' };

const TEXT_ORIENTATIONS: { label: string; value: TextOrientation }[] = [
  { label: 'Horizontal', value: { kind: 'rotate', deg: 0 } },
  { label: 'Vertical ↓', value: { kind: 'rotate', deg: 90 } },
  { label: 'Vertical ↑', value: { kind: 'rotate', deg: -90 } },
  { label: 'Apilado', value: { kind: 'stack' } },
];

const orientationLabel = (o: TextOrientation) =>
  o.kind === 'stack' ? 'Apilado' : `${o.deg}°`;
const sameOrientation = (a: TextOrientation, b: TextOrientation) =>
  a.kind === 'stack' && b.kind === 'stack'
    ? true
    : a.kind === 'rotate' && b.kind === 'rotate' && a.deg === b.deg;

type Step = 'color' | 'design';
type DragKind = { type: 'image'; index: number } | { type: 'text' } | null;

/**
 * Página independiente (abre en nueva pestaña) para personalizar un producto.
 * Paso 1: el cliente ve fotos del mug en blanco con cada color disponible y elige uno.
 * Paso 2: con el color elegido, sube imagen y/o texto y los ubica donde quiera.
 */
export default function CustomizeProduct() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState<'idle' | 'preview' | 'uploading' | 'cart'>('idle');

  const [step, setStep] = useState<Step>('color');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);

  const [customText, setCustomText] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [textColor, setTextColor] = useState('#1f1f1f');
  const [textSize, setTextSize] = useState(22);
  const [textFont, setTextFont] = useState(FONT_OPTIONS[0].value);
  const [textOrientation, setTextOrientation] = useState<TextOrientation>({
    kind: 'rotate',
    deg: 0,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [imagePositions, setImagePositions] = useState<{ x: number; y: number; scale: number }[]>([]);
  const [textPos, setTextPos] = useState({ x: 50, y: 82 });
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragKind = useRef<DragKind>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Inicia sesión para personalizar');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productService
      .getBySlug(slug)
      .then(p => {
        setProduct(p);
        document.title = `Personalizar: ${p.name}`;
        const colors = (p.colors || []).filter(c => c.isAvailable);
        // Si no hay colores disponibles, saltamos directo al diseño
        if (colors.length === 0) setStep('design');
      })
      .catch(() => toast.error('Producto no encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviews([]);
      return;
    }
    const urls = imageFiles.map(f => URL.createObjectURL(f));
    setImagePreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [imageFiles]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    setImageFiles(prev => {
      const remaining = MAX_IMAGES - prev.length;
      if (remaining <= 0) {
        toast.error(`Solo puedes subir hasta ${MAX_IMAGES} imágenes`);
        return prev;
      }
      const accepted: File[] = [];
      for (const file of incoming.slice(0, remaining)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`"${file.name}": solo se permiten JPEG o PNG`);
          continue;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
          toast.error(`"${file.name}" supera ${MAX_IMAGE_MB}MB`);
          continue;
        }
        accepted.push(file);
      }
      if (accepted.length === 0) return prev;
      setImagePositions(positions => [
        ...positions,
        ...accepted.map((_, i) => ({
          x: 50 + (prev.length + i - 1) * 8,
          y: 50 + (prev.length + i - 1) * 8,
          scale: 35,
        })),
      ]);
      setActiveImageIndex(prev.length);
      if (incoming.length > remaining) {
        toast.error(`Máximo ${MAX_IMAGES} imágenes — se ignoraron las extra`);
      }
      return [...prev, ...accepted];
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePositions(prev => prev.filter((_, i) => i !== index));
    setActiveImageIndex(idx => Math.max(0, Math.min(idx, imageFiles.length - 2)));
  };

  const startDrag = (e: React.PointerEvent, kind: Exclude<DragKind, null>) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragKind.current = kind;
    if (kind.type === 'image') setActiveImageIndex(kind.index);
    const rect = canvasRef.current.getBoundingClientRect();
    const pos = kind.type === 'image' ? imagePositions[kind.index] : textPos;
    if (!pos) return;
    const elemX = (pos.x / 100) * rect.width;
    const elemY = (pos.y / 100) * rect.height;
    dragOffset.current = {
      x: e.clientX - rect.left - elemX,
      y: e.clientY - rect.top - elemY,
    };
  };

  const onCanvasPointerMove = (e: React.PointerEvent) => {
    if (!dragKind.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - dragOffset.current.x) / rect.width) * 100;
    const y = ((e.clientY - rect.top - dragOffset.current.y) / rect.height) * 100;
    const cx = Math.max(5, Math.min(95, x));
    const cy = Math.max(5, Math.min(95, y));
    if (dragKind.current.type === 'image') {
      const idx = dragKind.current.index;
      setImagePositions(prev => prev.map((p, i) => (i === idx ? { ...p, x: cx, y: cy } : p)));
    } else {
      setTextPos({ x: cx, y: cy });
    }
  };

  const endDrag = () => {
    dragKind.current = null;
  };

  const pickColor = (color: ProductColor) => {
    setSelectedColor(color);
    setStep('design');
  };

  const handleConfirm = async () => {
    if (!product) return;
    if (product.allowsColorSelection && !selectedColor) {
      toast.error('Selecciona un color');
      setStep('color');
      return;
    }
    if (!customText.trim() && imageFiles.length === 0 && !specialInstructions.trim()) {
      toast.error('Agrega un texto, una imagen o instrucciones para personalizar');
      return;
    }
    setSubmitting(true);
    try {
      const urls: string[] = [];

      // 1) Snapshot del canvas (mockup + imágenes + texto, tal como el cliente lo armó).
      //    Se sube primero para que el admin la vea como "Vista previa del cliente".
      //    Marcamos la URL con el fragmento #preview (el navegador lo ignora al cargar).
      if (canvasRef.current) {
        setSubmitStage('preview');
        console.info('[Personalización] 1/3 Capturando canvas...');
        try {
          const blob = await toBlob(canvasRef.current, {
            backgroundColor: '#f8fafc',
            pixelRatio: 2,
            // NO usar cacheBust: rompe las URLs blob: (imágenes locales del cliente)
            // porque les agrega ?<timestamp> y blob URLs no aceptan query strings.
            // Google Fonts (fonts.googleapis.com) bloquea acceso a cssRules por CORS.
            // Saltamos el embedding de fonts: ya están renderizadas por el navegador
            // y el snapshot las captura visualmente sin necesidad de inlinearlas.
            skipFonts: true,
            // Filtramos <link>/<style> externos que rompen el parseo de CSS.
            filter: (node) => {
              if (!(node instanceof Element)) return true;
              const tag = node.tagName?.toLowerCase();
              if (tag === 'link' || tag === 'style') return false;
              return true;
            },
          });
          if (!blob) {
            throw new Error('La captura devolvió un blob vacío');
          }
          console.info('[Personalización] 2/3 Subiendo vista previa a Cloudinary...', blob.size, 'bytes');
          const previewFile = new File([blob], `preview-${Date.now()}.png`, { type: 'image/png' });
          const uploaded = await uploadService.uploadCustomizationImage(previewFile);
          urls.push(`${uploaded.url}#preview`);
          console.info('[Personalización] 3/3 Vista previa subida OK:', uploaded.url);
        } catch (err: any) {
          console.error('[Personalización] FALLÓ la vista previa:', err);
          const errMsg = err?.message || (err instanceof Event ? 'fallo al cargar un recurso externo' : 'error desconocido');
          toast.error(`No se pudo generar la vista previa: ${errMsg}`, { duration: 6000 });
        }
      }

      // 2) Imágenes originales subidas por el cliente (en alta resolución, para producción).
      if (imageFiles.length > 0) {
        setSubmitStage('uploading');
        const uploads = await Promise.all(
          imageFiles.map(file => uploadService.uploadCustomizationImage(file))
        );
        uploads.forEach(u => urls.push(u.url));
      }

      const customImageUrl = urls.length > 0 ? urls.join('|') : undefined;
      setSubmitStage('cart');

      const parts: string[] = [];
      const trimmedText = customText.trim();
      if (trimmedText) {
        const fontLabel = FONT_OPTIONS.find(f => f.value === textFont)?.label || 'Inter';
        const orientation = TEXT_ORIENTATIONS.find(o =>
          sameOrientation(o.value, textOrientation)
        )?.label || orientationLabel(textOrientation);
        parts.push(`${trimmedText}\n\n[Estilo: ${fontLabel} · ${orientation}]`);
      }
      const trimmedInstructions = specialInstructions.trim();
      if (trimmedInstructions) {
        parts.push(`[Instrucciones del cliente]\n${trimmedInstructions}`);
      }
      const textForOrder: string | undefined = parts.length > 0 ? parts.join('\n\n') : undefined;

      await addItem({
        productId: product.id,
        quantity: 1,
        selectedColorId: selectedColor?.id,
        customText: textForOrder,
        customImageUrl,
      });
      toast.success('Producto personalizado agregado al carrito');
      // Como esta página suele abrirse en una pestaña nueva, redirigimos al carrito
      // dentro de la misma pestaña para que el cliente continúe el flujo de compra.
      navigate('/carrito');
    } catch {
      toast.error('No se pudo agregar al carrito');
    } finally {
      setSubmitting(false);
      setSubmitStage('idle');
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (!product)
    return <div className="text-center py-20 text-slate-400">Producto no encontrado</div>;

  const availableColors = (product.colors || []).filter(c => c.isAvailable);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {step === 'color' ? 'Elige el color o la forma' : 'Personaliza tu diseño'}
          </h1>
          <p className="text-sm text-purple-300/70 mt-1">{product.name}</p>
        </div>

        {step === 'design' && availableColors.length > 0 && (
          <button
            onClick={() => setStep('color')}
            className="flex items-center gap-2 text-sm text-purple-200 hover:text-white border border-purple-700/40 rounded-lg px-3 py-2"
          >
            <FaArrowLeft size={12} /> Cambiar color
          </button>
        )}
      </div>

      {/* Indicador de pasos */}
      {availableColors.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-8 text-xs">
          <span
            className={`flex items-center gap-1.5 ${
              step === 'color' ? 'text-secondary-400' : 'text-green-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 'color' ? 'bg-secondary-500 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {step === 'color' ? '1' : <FaCheck size={10} />}
            </span>
            Color
          </span>
          <span className="w-12 h-px bg-purple-700/40" />
          <span
            className={`flex items-center gap-1.5 ${
              step === 'design' ? 'text-secondary-400' : 'text-purple-400/50'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 'design' ? 'bg-secondary-500 text-white' : 'bg-purple-800 text-purple-300'
              }`}
            >
              2
            </span>
            Diseño
          </span>
        </div>
      )}

      {/* PASO 1: Selección de color (mugs en blanco) */}
      {step === 'color' && (
        <div>
          <p className="text-center text-sm text-purple-200/80 max-w-2xl mx-auto mb-8">
            Elige primero el color del mug en el que quieres imprimir tu diseño.
            En el siguiente paso podrás subir tu imagen y agregar el texto.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {availableColors.map(color => {
              const isSel = selectedColor?.id === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => pickColor(color)}
                  className={`group relative rounded-2xl border-2 p-4 flex flex-col items-center gap-3 transition-all ${
                    isSel
                      ? 'border-secondary-400 bg-secondary-500/10'
                      : 'border-purple-700/40 hover:border-secondary-400/60 bg-purple-900/40'
                  }`}
                >
                  {/* Imagen real del producto en este color (subida por admin) o fallback al SVG */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    {color.imageUrl ? (
                      <img
                        src={color.imageUrl}
                        alt={`${product.name} - ${color.colorName}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full p-2">
                        <MugTemplate
                          color={color.hexCode || '#fbbf24'}
                          placeholder="TU IMAGEN"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {color.hexCode && (
                      <span
                        className="w-5 h-5 rounded-full border border-white/30 shadow"
                        style={{ backgroundColor: color.hexCode }}
                      />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        isSel ? 'text-secondary-400' : 'text-white'
                      }`}
                    >
                      {color.colorName}
                    </span>
                  </div>

                  {isSel && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-secondary-500 text-white flex items-center justify-center">
                      <FaCheck size={10} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {availableColors.length === 0 && (
            <p className="text-center text-sm text-purple-300/70">
              Este producto no tiene colores configurados. Continúa al diseño.
            </p>
          )}
        </div>
      )}

      {/* PASO 2: Diseño (imagen + texto con drag) */}
      {step === 'design' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Canvas */}
          <div>
            <p className="text-sm text-purple-300/70 mb-4">
              Arrastra la imagen y el texto para ubicarlos donde lo prefieras. 
            </p>
            <div
              ref={canvasRef}
              onPointerMove={onCanvasPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
              className="relative aspect-square w-full max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-purple-700/40 bg-gradient-to-br from-gray-50 to-gray-100 select-none touch-none p-4"
            >
              {selectedColor?.imageUrl ? (
                <img
                  src={selectedColor.imageUrl}
                  alt={selectedColor.colorName}
                  crossOrigin="anonymous"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
              ) : (
                <MugTemplate
                  color={selectedColor?.hexCode || '#fbbf24'}
                  showPrintArea
                  placeholder={imagePreviews.length === 0 && !customText ? 'TU DISEÑO' : undefined}
                />
              )}

              {imagePreviews.map((preview, idx) => {
                const pos = imagePositions[idx];
                if (!pos) return null;
                const isActive = idx === activeImageIndex;
                return (
                  <img
                    key={idx}
                    src={preview}
                    alt={`Diseño ${idx + 1}`}
                    onPointerDown={e => startDrag(e, { type: 'image', index: idx })}
                    draggable={false}
                    style={{
                      position: 'absolute',
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      width: `${pos.scale}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'move',
                      zIndex: isActive ? 10 : idx + 1,
                    }}
                    className={`border-2 border-dashed rounded-sm ${
                      isActive
                        ? 'border-secondary-400'
                        : 'border-secondary-400/40 hover:border-secondary-400'
                    }`}
                  />
                );
              })}

              {customText && (
                <div
                  key={textOrientation.kind}
                  data-stacked={textOrientation.kind === 'stack' ? 'v3' : undefined}
                  translate="no"
                  lang="zxx"
                  onPointerDown={e => startDrag(e, { type: 'text' })}
                  style={{
                    position: 'absolute',
                    left: `${textPos.x}%`,
                    top: `${textPos.y}%`,
                    transform:
                      textOrientation.kind === 'stack'
                        ? 'translate(-50%, -50%)'
                        : `translate(-50%, -50%) rotate(${textOrientation.deg}deg)`,
                    cursor: 'move',
                    color: textColor,
                    fontFamily: textFont,
                    fontSize: `${textSize}px`,
                    fontWeight: 700,
                    padding: '4px 8px',
                    transformOrigin: 'center',
                    whiteSpace: 'normal',
                    ...(textOrientation.kind === 'stack'
                      ? {
                          lineHeight: 1,
                        }
                      : {
                          textAlign: 'center' as const,
                          whiteSpace: 'pre-wrap' as const,
                          maxWidth: '85%',
                          lineHeight: 1.2,
                        }),
                  }}
                  className="border-2 border-dashed border-transparent hover:border-secondary-400 rounded-sm select-none notranslate"
                >
                  {textOrientation.kind === 'stack'
                    ? customText.split('\n').map((line, lineIdx) => (
                        <div
                          key={lineIdx}
                          style={{
                            display: 'inline-block',
                            verticalAlign: 'top',
                            textAlign: 'center',
                            marginRight: lineIdx < customText.split('\n').length - 1 ? '0.5em' : 0,
                            lineHeight: 1,
                            whiteSpace: 'normal',
                          }}
                        >
                          {Array.from(line).map((ch, i) => (
                            <div key={i} style={{ display: 'block', minHeight: '0.6em', fontFamily: 'inherit', whiteSpace: 'normal', lineHeight: 1 }}>
                          {ch === ' ' ? ' ' : ch}
                            </div>
                          ))}
                        </div>
                      ))
                    : customText}
                </div>
              )}
            </div>

            {imageFiles.length > 0 && imagePositions[activeImageIndex] && (
              <div className="mt-4 max-w-2xl mx-auto">
                <label className="text-xs text-purple-200 font-medium block mb-1">
                  Tamaño de imagen {activeImageIndex + 1} de {imageFiles.length}
                </label>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={imagePositions[activeImageIndex].scale}
                  onChange={e => {
                    const scale = Number(e.target.value);
                    setImagePositions(prev =>
                      prev.map((p, i) => (i === activeImageIndex ? { ...p, scale } : p))
                    );
                  }}
                  className="w-full accent-secondary-500"
                />
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="space-y-6">
            {selectedColor && (
              <div className="flex items-center gap-3 bg-purple-900/40 border border-purple-700/40 rounded-lg px-4 py-3">
                {selectedColor.imageUrl ? (
                  <img
                    src={selectedColor.imageUrl}
                    alt={selectedColor.colorName}
                    className="w-10 h-10 rounded-md object-cover border border-white/30"
                  />
                ) : (
                  <span
                    className="w-6 h-6 rounded-full border border-white/30"
                    style={{ backgroundColor: selectedColor.hexCode || '#fbbf24' }}
                  />
                )}
                <div className="flex-1">
                  <p className="text-xs text-purple-300/70">Color seleccionado</p>
                  <p className="text-sm font-semibold text-white">
                    {selectedColor.colorName}
                  </p>
                </div>
              </div>
            )}

            {product.allowsImageUpload && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">
                    Imágenes ({imageFiles.length}/{MAX_IMAGES})
                  </h3>
                </div>
                {imageFiles.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {imageFiles.map((file, idx) => {
                      const isActive = idx === activeImageIndex;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`flex items-center gap-3 rounded-lg p-3 border cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-secondary-500/10 border-secondary-400'
                              : 'bg-purple-900/40 border-purple-700/40 hover:border-secondary-400/60'
                          }`}
                        >
                          <img
                            src={imagePreviews[idx]}
                            alt={`Diseño ${idx + 1}`}
                            className="w-12 h-12 object-cover rounded-md border border-purple-700/40 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {idx + 1}. {file.name}
                            </p>
                            <p className="text-xs text-purple-300/60">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            className="p-2 text-red-400 hover:text-red-300"
                            aria-label="Quitar imagen"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {imageFiles.length < MAX_IMAGES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-purple-700/50 hover:border-secondary-400 rounded-lg text-purple-200 hover:text-secondary-400 transition-colors bg-purple-900/20"
                  >
                    <FaCloudUploadAlt size={26} />
                    <span className="text-sm font-medium">
                      {imageFiles.length === 0 ? 'Subir imágenes' : 'Agregar otra imagen'}
                    </span>
                    <span className="text-xs text-purple-300/60">
                      JPEG o PNG, máx. {MAX_IMAGE_MB}MB · Hasta {MAX_IMAGES} imágenes
                    </span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className="hidden"
                  onChange={e => {
                    handleFileSelect(e.target.files);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                />
              </section>
            )}

            {product.allowsText && (
              <section>
                <h3 className="font-semibold text-white mb-3">Texto personalizado</h3>
                <textarea
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="Escribe el texto que deseas..."
                  className="w-full px-3 py-2 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg text-sm focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                />
                <p className="text-[11px] text-purple-300/60 mt-1">
                  {customText.length}/200 caracteres
                </p>

                {customText && (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-purple-200 block mb-1">
                          Color de texto
                        </label>
                        <input
                          type="color"
                          value={textColor}
                          onChange={e => setTextColor(e.target.value)}
                          className="w-full h-10 rounded-md border border-purple-700/40 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-purple-200 block mb-1">
                          Tamaño ({textSize}px)
                        </label>
                        <input
                          type="range"
                          min={12}
                          max={48}
                          value={textSize}
                          onChange={e => setTextSize(Number(e.target.value))}
                          className="w-full mt-2 accent-secondary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-purple-200 block mb-1">
                        Tipo de fuente
                      </label>
                      <select
                        value={textFont}
                        onChange={e => setTextFont(e.target.value)}
                        style={{ fontFamily: textFont }}
                        className="w-full px-3 py-2 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg text-sm focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                      >
                        {FONT_OPTIONS.map(opt => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            style={{ fontFamily: opt.value }}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-purple-200 block mb-1">
                        Orientación
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {TEXT_ORIENTATIONS.map(opt => {
                          const isActive = sameOrientation(textOrientation, opt.value);
                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => setTextOrientation(opt.value)}
                              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                                isActive
                                  ? 'bg-secondary-500/20 border-secondary-400 text-secondary-300'
                                  : 'bg-purple-950/50 border-purple-700/40 text-purple-200 hover:border-secondary-400/60'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-purple-300/60 mt-1.5">
                        "Apilado" coloca cada letra encima de la otra (estilo letrero vertical).
                      </p>
                    </div>

                    {textOrientation.kind === 'rotate' && (
                      <div>
                        <label className="text-xs text-purple-200 block mb-1">
                          Rotación libre ({textOrientation.deg}°)
                        </label>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={textOrientation.deg}
                          onChange={e =>
                            setTextOrientation({ kind: 'rotate', deg: Number(e.target.value) })
                          }
                          className="w-full accent-secondary-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            <section>
              <h3 className="font-semibold text-white mb-2">Instrucciones para producción</h3>
              <p className="text-[11px] text-purple-300/60 mb-2 leading-relaxed">
                Cuéntanos cualquier detalle que quieras para tu personalización: ubicación
                preferida del diseño, colores específicos, referencias, fechas, etc.
              </p>
              <textarea
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Ej: Quiero que la imagen vaya centrada en el pecho, con tinta brillante y el nombre 'Mariana' debajo en color rojo."
                className="w-full px-3 py-2 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg text-sm focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
              />
              <p className="text-[11px] text-purple-300/60 mt-1">
                {specialInstructions.length}/600 caracteres
              </p>
            </section>

            <p className="text-[11px] text-purple-300/60 leading-relaxed">
              Al enviar tu personalización, aceptas nuestros{' '}
              <a
                href="/terminos-condiciones"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-secondary-400"
              >
                Términos y condiciones
              </a>{' '}
              y{' '}
              <a
                href="/politica-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-secondary-400"
              >
                Política de privacidad
              </a>
              .
            </p>

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-secondary-500/20"
            >
              <FaShoppingCart />
              {submitStage === 'preview' && 'Generando vista previa...'}
              {submitStage === 'uploading' && 'Subiendo imágenes...'}
              {submitStage === 'cart' && 'Añadiendo al carrito...'}
              {submitStage === 'idle' && 'Confirmar diseño y añadir al carrito'}
            </button>
            <p className="text-[11px] text-purple-300/60 mt-2 text-center leading-relaxed">
              Al confirmar, capturamos una vista previa de tu diseño tal como lo armaste para que el equipo de producción la vea.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
