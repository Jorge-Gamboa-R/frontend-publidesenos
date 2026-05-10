import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaTimes, FaArrowLeft, FaCloudUploadAlt, FaCheck, FaShoppingCart } from 'react-icons/fa';
import { uploadService } from '../../services/upload.service';
import type { Product, ProductColor } from '../../types';

interface CustomizeMugModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: (data: {
    selectedColorId?: string;
    customText?: string;
    customImageUrl?: string;
  }) => Promise<void> | void;
}

const MAX_IMAGE_MB = 15;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

export default function CustomizeMugModal({ product, onClose, onConfirm }: CustomizeMugModalProps) {
  const availableColors = useMemo(
    () => (product.colors || []).filter(c => c.isAvailable),
    [product.colors]
  );

  const needsColor = product.allowsColorSelection && availableColors.length > 0;
  const needsImage = product.allowsImageUpload;
  const needsText = product.allowsText;

  const [step, setStep] = useState<'color' | 'design'>(needsColor ? 'color' : 'design');
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [customText, setCustomText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && !submitting && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose, submitting]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const primaryImage = product.images?.find(i => i.isPrimary) || product.images?.[0];

  const pickColor = (color: ProductColor) => {
    setSelectedColor(color);
    setStep('design');
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Solo se permiten imágenes JPEG o PNG');
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar ${MAX_IMAGE_MB}MB`);
      return;
    }
    setImageFile(file);
  };

  const clearImage = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = async () => {
    if (needsColor && !selectedColor) {
      toast.error('Selecciona un color antes de continuar');
      setStep('color');
      return;
    }
    setSubmitting(true);
    try {
      let customImageUrl: string | undefined;
      if (imageFile) {
        const res = await uploadService.uploadCustomizationImage(imageFile);
        customImageUrl = res.url;
      }
      await onConfirm({
        selectedColorId: selectedColor?.id,
        customText: customText.trim() || undefined,
        customImageUrl,
      });
    } catch {
      toast.error('No se pudo procesar la personalización');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 overflow-y-auto"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-gradient-to-br from-purple-950 to-purple-900 border border-purple-700/40 rounded-2xl w-full max-w-4xl shadow-2xl my-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-purple-700/40">
          <div className="flex items-center gap-3 min-w-0">
            {step === 'design' && needsColor && (
              <button
                onClick={() => setStep('color')}
                className="p-2 rounded-lg text-purple-200 hover:bg-purple-800/50"
                aria-label="Volver a elegir color"
                disabled={submitting}
              >
                <FaArrowLeft size={14} />
              </button>
            )}
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                {step === 'color' ? 'Elige el color de tu mug' : 'Personaliza tu diseño'}
              </h3>
              <p className="text-xs text-purple-300/70 truncate">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-lg text-purple-200 hover:bg-purple-800/50 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Step indicator */}
        {needsColor && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 text-xs">
            <span className={`flex items-center gap-1.5 ${step === 'color' ? 'text-secondary-400' : 'text-green-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 'color' ? 'bg-secondary-500 text-white' : 'bg-green-500 text-white'}`}>
                {step === 'color' ? '1' : <FaCheck size={10} />}
              </span>
              Color
            </span>
            <span className="w-8 h-px bg-purple-700/40" />
            <span className={`flex items-center gap-1.5 ${step === 'design' ? 'text-secondary-400' : 'text-purple-400/50'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step === 'design' ? 'bg-secondary-500 text-white' : 'bg-purple-800 text-purple-300'}`}>
                2
              </span>
              Diseño
            </span>
          </div>
        )}

        {/* Body */}
        <div className="px-5 sm:px-6 pb-6">
          {step === 'color' && (
            <div>
              <p className="text-sm text-purple-200/80 mb-4">
                Selecciona una de las opciones disponibles. El interior y el asa del mug tendrán el color elegido.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableColors.map(color => {
                  const isSelected = selectedColor?.id === color.id;
                  return (
                    <button
                      key={color.id}
                      onClick={() => pickColor(color)}
                      className={`group relative rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-secondary-400 bg-secondary-500/10'
                          : 'border-purple-700/40 hover:border-secondary-400/60 bg-purple-900/40'
                      }`}
                    >
                      <div className="relative w-full aspect-square rounded-lg bg-white overflow-hidden flex items-center justify-center">
                        {primaryImage ? (
                          <img src={primaryImage.imageUrl} alt={color.colorName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[10px] font-bold tracking-widest text-gray-400">YOUR IMAGE</div>
                        )}
                        <span
                          className="absolute bottom-0 left-0 right-0 h-2"
                          style={{ backgroundColor: color.hexCode || undefined }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: color.hexCode || undefined }}
                        />
                        <span className={`text-sm font-medium ${isSelected ? 'text-secondary-400' : 'text-white'}`}>
                          {color.colorName}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-secondary-500 text-white flex items-center justify-center">
                          <FaCheck size={10} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'design' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <h4 className="text-sm font-semibold text-purple-200 mb-2">Vista previa aproximada</h4>
                <div
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-purple-700/50 bg-white flex items-center justify-center"
                  style={selectedColor ? { backgroundColor: `${selectedColor.hexCode}22` } : undefined}
                >
                  {primaryImage ? (
                    <img src={primaryImage.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-sm text-gray-400">Sin imagen base</div>
                  )}
                  {imagePreview && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative border-2 border-dashed border-red-400/80 rounded-md p-1 bg-white/70">
                        <img
                          src={imagePreview}
                          alt="Tu diseño"
                          className="max-w-[60%] max-h-[60%] object-contain mx-auto"
                          style={{ maxWidth: '180px', maxHeight: '180px' }}
                        />
                        {customText && (
                          <p className="text-center text-[11px] font-semibold text-gray-800 mt-1 break-words max-w-[180px]">
                            {customText}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {!imagePreview && customText && (
                    <p className="absolute bottom-3 left-3 right-3 text-center text-sm font-semibold text-gray-800 bg-white/80 rounded px-2 py-1">
                      {customText}
                    </p>
                  )}
                </div>
                {selectedColor && (
                  <p className="mt-2 text-xs text-purple-300/70 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: selectedColor?.hexCode || undefined }}
                    />
                    Color: <span className="text-white font-medium">{selectedColor.colorName}</span>
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-5">
                {needsImage && (
                  <div>
                    <label className="block text-sm font-semibold text-purple-200 mb-2">Imagen</label>
                    {imageFile ? (
                      <div className="flex items-start gap-3 bg-purple-900/40 border border-purple-700/40 rounded-lg p-3">
                        <img
                          src={imagePreview!}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-md border border-purple-700/40"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white truncate">{imageFile.name}</p>
                          <p className="text-xs text-purple-300/70">
                            {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            onClick={clearImage}
                            className="mt-1 text-xs text-red-400 hover:text-red-300"
                          >
                            Quitar imagen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 py-6 px-4 border-2 border-dashed border-purple-700/50 hover:border-secondary-400 rounded-lg text-purple-200 hover:text-secondary-400 transition-colors bg-purple-900/20"
                      >
                        <FaCloudUploadAlt size={28} />
                        <span className="text-sm font-medium">Subir imagen</span>
                        <span className="text-xs text-purple-300/60">Haz clic para seleccionar</span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={e => handleFileSelect(e.target.files?.[0] || null)}
                    />
                    <p className="mt-2 text-[11px] text-purple-300/70 leading-relaxed">
                      Para garantizar la calidad de impresión, recomendamos cargar una imagen JPEG o PNG
                      de alta definición que no supere los {MAX_IMAGE_MB}MB.
                    </p>
                  </div>
                )}

                {needsText && (
                  <div>
                    <label className="block text-sm font-semibold text-purple-200 mb-2">Texto personalizado</label>
                    <textarea
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      maxLength={500}
                      rows={3}
                      placeholder="Escribe el texto que deseas..."
                      className="w-full px-3 py-2 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg text-sm focus:ring-2 focus:ring-secondary-400 focus:border-transparent"
                    />
                    <p className="text-[11px] text-purple-300/60 mt-1">{customText.length}/500 caracteres</p>
                  </div>
                )}

                <p className="text-[11px] text-purple-300/60">
                  Al enviar tu personalización, aceptas nuestros{' '}
                  <a href="/terminos" className="underline hover:text-secondary-400">Términos y condiciones</a> y{' '}
                  <a href="/privacidad" className="underline hover:text-secondary-400">Política de privacidad</a>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-purple-700/40 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-sm font-medium text-purple-200 hover:text-white disabled:opacity-50"
          >
            Cancelar
          </button>

          {step === 'color' ? (
            <button
              onClick={() => selectedColor ? setStep('design') : toast.error('Selecciona un color para continuar')}
              disabled={!selectedColor}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              <FaShoppingCart />
              {submitting ? 'Agregando...' : 'Añadir al carrito'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
