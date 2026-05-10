import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaTags } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { categoryService } from '../../services/category.service';
import Spinner from '../../components/ui/Spinner';
import type { Category } from '../../types';

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getAll()
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', sortOrder: 0 });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const sortOrder = Number(form.sortOrder);
    const duplicate = categories.find(
      c => c.sortOrder === sortOrder && (!editing || c.id !== editing.id)
    );
    if (duplicate) {
      toast.error(`Ya existe la categoría "${duplicate.name}" con el orden ${sortOrder}.`);
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        sortOrder,
      };
      if (editing) {
        await categoryService.update(editing.id, data);
        toast.success('Categoría actualizada');
      } else {
        await categoryService.create(data);
        toast.success('Categoría creada');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    try {
      await categoryService.delete(id);
      toast.success('Categoría eliminada');
      fetchCategories();
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al eliminar';
      toast.error(msg, { duration: 6000 });
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 p-6 lg:p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/2 w-48 h-48 bg-fuchsia-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <FaTags size={20} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Categorías</h1>
              <p className="text-pink-100 text-sm mt-0.5">Organiza tus productos por categorías</p>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-white text-pink-600 px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            <FaPlus /> Nueva Categoría
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-orange-50">
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Imagen</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const thumb = cat.imageUrl || cat.products?.[0]?.images?.[0]?.imageUrl;
              return (
              <tr key={cat.id} className="border-b border-slate-100 hover:bg-pink-50/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 text-white text-xs font-bold shadow shadow-pink-500/20">
                    {cat.sortOrder}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 ring-2 ring-pink-100/40 flex items-center justify-center">
                    {thumb ? (
                      <img src={thumb} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{cat.name}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3">
                  <span className="bg-gradient-to-r from-pink-100 to-orange-100 text-pink-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-pink-200/50">
                    {cat._count?.products ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(cat)} className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors" title="Editar">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">No hay categorías creadas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 p-5 text-white flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Ej: Gorras, Llaveros, Mugs..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Descripción opcional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Orden</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => setForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-400 mt-1">Las categorías se ordenan de menor a mayor</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-orange-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50">
                  {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Categoría'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
