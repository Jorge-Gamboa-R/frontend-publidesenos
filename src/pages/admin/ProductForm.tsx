import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUpload, FaTrash, FaStar, FaSpinner, FaBox, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import type { Category, ProductImage, ProductVideo, ProductColor } from '../../types';

/** Formulario para crear/editar productos con subida de imágenes */
export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [videos, setVideos] = useState<ProductVideo[]>([]);
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [uploadingColor, setUploadingColor] = useState(false);
  const colorFileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [productId, setProductId] = useState<string | null>(id || null);
  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '', basePrice: '', discountPrice: '',
    taxPercent: '', stock: '', sku: '', categoryId: '', isCustomizable: true, allowsText: false,
    allowsImageUpload: false, allowsColorSelection: false, isFeatured: false, isActive: true,
  });

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    if (isEditing) {
      productService.getById(id!).then(product => {
        const taxPct = product.taxRate != null ? +(Number(product.taxRate) * 100).toFixed(2) : 0;
        setForm({
          name: product.name, description: product.description || '',
          shortDescription: product.shortDescription || '',
          basePrice: String(product.basePrice), discountPrice: product.discountPrice ? String(product.discountPrice) : '',
          taxPercent: taxPct ? String(taxPct) : '',
          stock: String(product.stock), sku: product.sku, categoryId: product.categoryId || '',
          isCustomizable: product.isCustomizable, allowsText: product.allowsText,
          allowsImageUpload: product.allowsImageUpload, allowsColorSelection: product.allowsColorSelection,
          isFeatured: product.isFeatured, isActive: product.isActive,
        });
        if (product.images) setImages(product.images);
        if (product.videos) setVideos(product.videos);
        if (product.colors) setColors(product.colors);
      }).catch(() => toast.error('Error al cargar el producto'));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { taxPercent, ...rest } = form;
      const taxPct = taxPercent === '' ? 0 : Number(taxPercent);
      const data = {
        ...rest,
        basePrice: Number(form.basePrice),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        taxRate: Number.isFinite(taxPct) ? +(taxPct / 100).toFixed(4) : 0,
        stock: Number(form.stock),
        categoryId: form.categoryId || null,
      };

      if (isEditing) {
        await productService.update(id!, data);
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['product'] });
        toast.success('Producto actualizado');
      } else {
        const created = await productService.create(data);
        setProductId(created.id);
        toast.success('Producto creado. Ahora puedes subir imágenes.');
        navigate(`/admin/productos/${created.id}/editar`, { replace: true });
        return;
      }
      navigate('/admin/productos');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !productId) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const image = await productService.addImage(productId, file);
        setImages(prev => [...prev, image]);
      }
      toast.success('Imagen(es) subida(s)');
    } catch {
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!productId || !confirm('¿Eliminar esta imagen?')) return;
    try {
      await productService.deleteImage(productId, imageId);
      setImages(prev => prev.filter(i => i.id !== imageId));
      toast.success('Imagen eliminada');
    } catch {
      toast.error('Error al eliminar imagen');
    }
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !productId) return;

    setUploadingVideo(true);
    try {
      for (const file of Array.from(files)) {
        const video = await productService.addVideo(productId, file);
        setVideos(prev => [...prev, video]);
      }
      toast.success('Video(s) subido(s)');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al subir video');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!productId || !confirm('¿Eliminar este video?')) return;
    try {
      await productService.deleteVideo(productId, videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
      toast.success('Video eliminado');
    } catch {
      toast.error('Error al eliminar video');
    }
  };

  const handleUploadColor = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !productId) return;

    const name = newColorName.trim();
    if (!name) {
      toast.error('Escribe un nombre para esta variante de color');
      if (colorFileInputRef.current) colorFileInputRef.current.value = '';
      return;
    }

    setUploadingColor(true);
    try {
      const color = await productService.addColor(productId, file, name);
      setColors(prev => [...prev, color]);
      setNewColorName('');
      toast.success('Color agregado');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al subir color');
    } finally {
      setUploadingColor(false);
      if (colorFileInputRef.current) colorFileInputRef.current.value = '';
    }
  };

  const handleDeleteColor = async (colorId: string) => {
    if (!productId || !confirm('¿Eliminar esta variante de color?')) return;
    try {
      await productService.deleteColor(productId, colorId);
      setColors(prev => prev.filter(c => c.id !== colorId));
      toast.success('Color eliminado');
    } catch {
      toast.error('Error al eliminar el color');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!productId) return;
    try {
      await productService.setPrimaryImage(productId, imageId);
      setImages(prev => prev.map(i => ({ ...i, isPrimary: i.id === imageId })));
      toast.success('Imagen principal actualizada');
    } catch {
      toast.error('Error al actualizar imagen principal');
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-orange-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-pink-600 to-fuchsia-600 p-6 lg:p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <FaBox size={20} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
              </h1>
              <p className="text-orange-100 text-sm mt-0.5">
                {isEditing ? 'Actualiza la información, imágenes y variantes del producto' : 'Crea un nuevo producto personalizable'}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/admin/productos')}
            className="flex items-center gap-2 bg-white/15 backdrop-blur text-white border border-white/30 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/25 transition-colors">
            <FaArrowLeft size={12} /> Volver
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
        {/* Información básica */}
        <div className="bg-white rounded-2xl p-6 border border-orange-100/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-pink-600 rounded-full" />
            <h2 className="font-bold text-slate-800">Información básica</h2>
          </div>
          <div>
            <label className={labelClass}>Nombre *</label>
            <input name="name" required value={form.name} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción corta</label>
            <input name="shortDescription" value={form.shortDescription} onChange={handleChange} maxLength={500} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Descripción completa</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClass}>
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Precio e inventario */}
        <div className="bg-white rounded-2xl p-6 border border-orange-100/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-pink-500 to-fuchsia-600 rounded-full" />
            <h2 className="font-bold text-slate-800">Precio e inventario</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Precio base (COP) *</label>
              <input name="basePrice" type="number" required min="0" step="any" placeholder="0"
                value={form.basePrice} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Precio con descuento</label>
              <input name="discountPrice" type="number" min="0" step="any" placeholder="0"
                value={form.discountPrice} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>IVA (%)</label>
              <input name="taxPercent" type="number" min="0" max="100" step="0.01" placeholder="0"
                value={form.taxPercent} onChange={handleChange} className={inputClass} />
              <p className="text-xs text-slate-400 mt-1.5">Deja en 0 si este producto no aplica IVA. Ej: 19 para 19%.</p>
            </div>
            <div>
              <label className={labelClass}>Stock *</label>
              <input name="stock" type="number" required min="0" placeholder="0"
                value={form.stock} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>SKU *</label>
            <input name="sku" required value={form.sku} onChange={handleChange} className={`${inputClass} font-mono`} />
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white rounded-2xl p-6 border border-orange-100/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-fuchsia-500 to-purple-600 rounded-full" />
            <h2 className="font-bold text-slate-800">Imágenes del producto</h2>
          </div>

          {!isEditing && !productId ? (
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100 rounded-xl p-4">
              <p className="text-sm text-slate-600">Guarda el producto primero para poder subir imágenes.</p>
            </div>
          ) : (
            <>
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map(img => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-orange-100 ring-1 ring-orange-100/50">
                      <img src={img.imageUrl} alt={img.altText || ''} className="w-full h-32 object-cover" />
                      {img.isPrimary && (
                        <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow shadow-amber-500/20">
                          <FaStar size={10} /> Principal
                        </span>
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.isPrimary && (
                          <button type="button" onClick={() => handleSetPrimary(img.id)}
                            className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg" title="Hacer principal">
                            <FaStar size={12} />
                          </button>
                        )}
                        <button type="button" onClick={() => handleDeleteImage(img.id)}
                          className="p-2 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg" title="Eliminar">
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
                  multiple onChange={handleUploadImage} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} translate="no"
                  className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-orange-200 rounded-xl text-orange-600 hover:border-orange-400 hover:bg-orange-50/50 transition-colors disabled:opacity-50 font-medium">
                  {uploading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                  <span>{uploading ? 'Subiendo...' : 'Subir imágenes'}</span>
                </button>
                <p className="text-xs text-slate-400 mt-1.5">JPG, PNG, WebP, SVG o GIF. Máximo 10MB por archivo.</p>
              </div>
            </>
          )}
        </div>

        {/* Videos */}
        <div className="bg-white rounded-2xl p-6 border border-orange-100/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-purple-600 to-fuchsia-600 rounded-full" />
            <h2 className="font-bold text-slate-800">Videos del producto</h2>
          </div>

          {!isEditing && !productId ? (
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100 rounded-xl p-4">
              <p className="text-sm text-slate-600">Guarda el producto primero para poder subir videos.</p>
            </div>
          ) : (
            <>
              {videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map(v => (
                    <div key={v.id} className="relative group rounded-xl overflow-hidden border border-orange-100 bg-black">
                      <video src={v.videoUrl} controls className="w-full h-40 object-cover" />
                      <button type="button" onClick={() => handleDeleteVideo(v.id)}
                        className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg opacity-0 group-hover:opacity-100" title="Eliminar">
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleUploadVideo} className="hidden" />
                <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploadingVideo} translate="no"
                  className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-orange-200 rounded-xl text-orange-600 hover:border-orange-400 hover:bg-orange-50/50 transition-colors disabled:opacity-50 font-medium">
                  {uploadingVideo ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                  <span>{uploadingVideo ? 'Subiendo...' : 'Subir video'}</span>
                </button>
                <p className="text-xs text-slate-400 mt-1.5">MP4, WebM o MOV. Máximo 100MB por video.</p>
              </div>
            </>
          )}
        </div>

        {/* Variantes de color */}
        <div className="bg-white rounded-2xl p-6 border border-orange-100/60 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-pink-500 via-fuchsia-500 to-orange-500 rounded-full" />
              <h2 className="font-bold text-slate-800">Variantes de color (imágenes)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-2 ml-3.5">
              Sube una foto del producto por cada color disponible. Estas imágenes
              aparecerán en el personalizador para que el cliente elija el color.
              Recuerda activar <strong>"Permite elegir color"</strong> en Opciones.
            </p>
          </div>

          {!isEditing && !productId ? (
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100 rounded-xl p-4">
              <p className="text-sm text-slate-600">
                Guarda el producto primero para poder subir variantes de color.
              </p>
            </div>
          ) : (
            <>
              {colors.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {colors.map(c => (
                    <div key={c.id} className="relative group rounded-xl overflow-hidden border border-pink-100 bg-slate-50 ring-1 ring-pink-100/50">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.colorName} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-xs text-slate-400 bg-gradient-to-br from-pink-50 to-orange-50">
                          Sin imagen
                        </div>
                      )}
                      <div className="px-2.5 py-1.5 bg-white border-t border-pink-100">
                        <p className="text-sm font-semibold text-slate-700 truncate">{c.colorName}</p>
                      </div>
                      <button type="button" onClick={() => handleDeleteColor(c.id)}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                        title="Eliminar variante">
                        <FaTrash size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-pink-100 pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Nombre de la variante
                  </label>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={e => setNewColorName(e.target.value)}
                    placeholder="Ej: Rojo, Azul oscuro, Edición Nacional..."
                    maxLength={50}
                    className="w-full px-3 py-2.5 bg-white border border-pink-100 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input ref={colorFileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={handleUploadColor} className="hidden" />
                  <button type="button" onClick={() => colorFileInputRef.current?.click()} disabled={uploadingColor}
                    className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-pink-200 rounded-xl text-pink-600 hover:border-pink-400 hover:bg-pink-50/50 transition-colors disabled:opacity-50 font-medium">
                    {uploadingColor ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                    <span>{uploadingColor ? 'Subiendo...' : 'Subir imagen del color'}</span>
                  </button>
                  <p className="text-xs text-slate-400 mt-1.5">
                    JPG, PNG o WebP. Máximo 10MB. Escribe primero el nombre del color.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Opciones */}
        <div className="bg-white rounded-2xl p-6 border border-orange-100/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-orange-500 via-pink-500 to-purple-600 rounded-full" />
            <h2 className="font-bold text-slate-800">Opciones</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'isCustomizable', label: 'Personalizable' },
              { name: 'allowsText', label: 'Permite texto' },
              { name: 'allowsImageUpload', label: 'Permite subir imagen' },
              { name: 'allowsColorSelection', label: 'Permite elegir color' },
              { name: 'isFeatured', label: 'Producto destacado' },
              { name: 'isActive', label: 'Activo' },
            ].map(opt => {
              const checked = (form as any)[opt.name];
              return (
                <label key={opt.name}
                  className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border transition-all ${
                    checked
                      ? 'bg-gradient-to-r from-orange-50 to-pink-50 border-pink-200 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-pink-200'
                  }`}>
                  <input type="checkbox" name={opt.name} checked={checked} onChange={handleChange}
                    className="w-4 h-4 accent-pink-600 rounded" />
                  <span className={`text-sm font-medium ${checked ? 'text-pink-700' : 'text-slate-700'}`}>
                    {opt.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="bg-gradient-to-r from-orange-500 via-pink-600 to-fuchsia-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Producto'}
          </button>
          <button type="button" onClick={() => navigate('/admin/productos')}
            className="px-8 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
