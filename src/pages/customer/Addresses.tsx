import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { addressService } from '../../services/address.service';
import Spinner from '../../components/ui/Spinner';
import { COLOMBIA_DEPARTMENTS, citiesOf } from '../../data/colombiaLocations';
import type { Address } from '../../types';

/** Gestión de direcciones de envío del cliente */
export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', street: '', city: '', state: '', postalCode: '', isDefault: false });

  useEffect(() => {
    addressService.getAll().then(setAddresses).finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ label: '', street: '', city: '', state: '', postalCode: '', isDefault: false });
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const updated = await addressService.update(editing, { ...form, country: 'Colombia' });
        setAddresses(prev => prev.map(a => a.id === editing ? updated : a));
        toast.success('Dirección actualizada');
      } else {
        const created = await addressService.create({ ...form, country: 'Colombia' });
        setAddresses(prev => [...prev, created]);
        toast.success('Dirección creada');
      }
      resetForm();
    } catch {
      toast.error('Error al guardar dirección');
    }
  };

  const handleEdit = (addr: Address) => {
    setForm({ label: addr.label || '', street: addr.street, city: addr.city, state: addr.state, postalCode: addr.postalCode, isDefault: addr.isDefault });
    setEditing(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    try {
      await addressService.delete(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success('Dirección eliminada');
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Mis Direcciones</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700">
            <FaPlus /> Nueva
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30 space-y-4 mb-6">
          <h2 className="font-bold text-white">{editing ? 'Editar Dirección' : 'Nueva Dirección'}</h2>
          <input placeholder="Etiqueta (ej: Casa, Oficina)" value={form.label}
            onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <input placeholder="Dirección *" required value={form.street}
            onChange={e => setForm(p => ({ ...p, street: e.target.value }))}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <div className="grid grid-cols-2 gap-4">
            <select required value={form.state}
              onChange={e => setForm(p => ({ ...p, state: e.target.value, city: '' }))}
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Departamento *</option>
              {COLOMBIA_DEPARTMENTS.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
            <select required value={form.city} disabled={!form.state}
              onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
              <option value="">{form.state ? 'Ciudad *' : 'Elige primero el departamento'}</option>
              {citiesOf(form.state).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <input placeholder="Código postal *" required value={form.postalCode}
            onChange={e => setForm(p => ({ ...p, postalCode: e.target.value }))}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))}
              className="w-4 h-4 text-primary-600 rounded" />
            <span className="text-sm text-purple-200">Dirección predeterminada</span>
          </label>
          <div className="flex gap-3">
            <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700">
              {editing ? 'Actualizar' : 'Guardar'}
            </button>
            <button type="button" onClick={resetForm} className="text-purple-300/60 px-4 py-2 hover:text-purple-200">Cancelar</button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <p className="text-center text-purple-300/60 py-10">No tienes direcciones guardadas</p>
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{addr.label || 'Dirección'}</h3>
                    {addr.isDefault && (
                      <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        <FaCheck size={10} /> Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-purple-200">{addr.street}</p>
                  <p className="text-sm text-purple-300/60">{addr.city}, {addr.state} {addr.postalCode}</p>
                  <p className="text-sm text-purple-400/50">{addr.country}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(addr)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded"><FaEdit /></button>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><FaTrash /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
