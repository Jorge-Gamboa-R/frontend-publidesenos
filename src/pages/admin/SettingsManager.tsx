import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCog, FaSave, FaIdBadge, FaPhoneAlt, FaBookOpen, FaPercent, FaUndo, FaCheckCircle } from 'react-icons/fa';
import { settingsService } from '../../services/settings.service';
import Spinner from '../../components/ui/Spinner';
import type { SiteSetting } from '../../types';
import type { IconType } from 'react-icons';

interface FieldDef {
  key: string;
  label: string;
  hint?: string;
  type?: 'text' | 'number' | 'textarea' | 'select' | 'email';
  prefix?: string;
  suffix?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  fullWidth?: boolean;
}

interface Section {
  key: string;
  title: string;
  description: string;
  icon: IconType;
  fields: FieldDef[];
}

const SECTIONS: Section[] = [
  {
    key: 'identidad',
    title: 'Identidad',
    description: 'Nombre y mensaje principal del sitio',
    icon: FaIdBadge,
    fields: [
      { key: 'site_name', label: 'Nombre del sitio', hint: 'Aparece en el header y en correos.' },
      { key: 'slogan', label: 'Slogan', hint: 'Frase corta debajo del nombre.' },
    ],
  },
  {
    key: 'contacto',
    title: 'Contacto',
    description: 'Cómo te encuentran tus clientes',
    icon: FaPhoneAlt,
    fields: [
      { key: 'phone', label: 'Teléfono', hint: 'Visible en el footer y página de contacto.' },
      { key: 'email', label: 'Email de contacto', type: 'email', hint: 'Recibe los mensajes del formulario.' },
      { key: 'address', label: 'Dirección', hint: 'Ubicación física, opcional.', fullWidth: true },
    ],
  },
  {
    key: 'contenido',
    title: 'Contenido',
    description: 'Misión y visión que aparecen en "Nosotros"',
    icon: FaBookOpen,
    fields: [
      { key: 'mission', label: 'Misión', type: 'textarea', rows: 3, fullWidth: true },
      { key: 'vision', label: 'Visión', type: 'textarea', rows: 3, fullWidth: true },
    ],
  },
  {
    key: 'comercio',
    title: 'Reglas comerciales',
    description: 'Envíos, impuestos y moneda',
    icon: FaPercent,
    fields: [
      { key: 'free_shipping_min', label: 'Envío gratis desde', type: 'number', prefix: '$', hint: 'Monto mínimo de compra para envío gratuito.' },
      { key: 'tax_rate', label: 'Tasa IVA', type: 'number', suffix: '0.0–1.0', hint: 'Decimal: 0.19 equivale a 19%.' },
      { key: 'currency', label: 'Moneda', type: 'select', options: [
        { value: 'COP', label: 'COP — Peso colombiano' },
        { value: 'USD', label: 'USD — Dólar estadounidense' },
        { value: 'EUR', label: 'EUR — Euro' },
      ] },
    ],
  },
];

export default function SettingsManager() {
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [extras, setExtras] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    settingsService.getAll().then(list => {
      const map: Record<string, string> = {};
      const known = new Set(SECTIONS.flatMap(s => s.fields.map(f => f.key)));
      const extra: SiteSetting[] = [];
      for (const s of list) {
        map[s.key] = s.value;
        if (!known.has(s.key)) extra.push(s);
      }
      setOriginal(map);
      setValues(map);
      setExtras(extra);
    }).finally(() => setLoading(false));
  }, []);

  const dirtyKeys = useMemo(
    () => Object.keys(values).filter(k => values[k] !== original[k]),
    [values, original]
  );

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setValues(original);
    toast('Cambios descartados', { icon: '↩️' });
  };

  const handleSave = async () => {
    if (dirtyKeys.length === 0) return;
    setSaving(true);
    try {
      await settingsService.update(dirtyKeys.map(k => ({ key: k, value: values[k] ?? '' })));
      setOriginal(values);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
      toast.success('Configuración guardada');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  const renderField = (f: FieldDef) => {
    const value = values[f.key] ?? '';
    const isDirty = dirtyKeys.includes(f.key);
    const inputClass = `w-full px-4 py-3 bg-white border ${isDirty ? 'border-fuchsia-400 ring-2 ring-fuchsia-100' : 'border-purple-100'} rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-sm transition-colors`;

    return (
      <div key={f.key} className={f.fullWidth ? 'sm:col-span-2' : ''}>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-slate-700">{f.label}</label>
          {isDirty && (
            <span className="text-[10px] uppercase tracking-wide text-fuchsia-600 font-semibold">Sin guardar</span>
          )}
        </div>
        {f.type === 'textarea' ? (
          <textarea value={value} rows={f.rows ?? 3}
            onChange={e => handleChange(f.key, e.target.value)}
            className={`${inputClass} resize-none`} />
        ) : f.type === 'select' ? (
          <select value={value} onChange={e => handleChange(f.key, e.target.value)} className={inputClass}>
            {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ) : (
          <div className="relative">
            {f.prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">{f.prefix}</span>
            )}
            <input type={f.type ?? 'text'} value={value}
              onChange={e => handleChange(f.key, e.target.value)}
              className={`${inputClass} ${f.prefix ? 'pl-7' : ''} ${f.suffix ? 'pr-16' : ''}`} />
            {f.suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">{f.suffix}</span>
            )}
          </div>
        )}
        {f.hint && <p className="text-xs text-slate-500 mt-1">{f.hint}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-orange-500 p-6 lg:p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-fuchsia-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
            <FaCog size={20} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Configuración</h1>
            <p className="text-orange-100 text-sm mt-0.5">Datos del sitio, contacto y reglas comerciales</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl space-y-5">
        {SECTIONS.map(section => (
          <section key={section.key} className="bg-white rounded-2xl p-6 border border-purple-100/60 shadow-sm">
            <header className="flex items-start gap-3 mb-5 pb-4 border-b border-purple-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-100 text-fuchsia-700 flex items-center justify-center shrink-0">
                <section.icon size={16} />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{section.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
              </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.fields.map(renderField)}
            </div>
          </section>
        ))}

        {/* Extras: settings que vinieron de la BD pero no están agrupados */}
        {extras.length > 0 && (
          <section className="bg-white rounded-2xl p-6 border border-purple-100/60 shadow-sm">
            <header className="mb-4">
              <h2 className="font-semibold text-slate-800">Otros</h2>
              <p className="text-xs text-slate-500 mt-0.5">Configuraciones adicionales</p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {extras.map(s => renderField({ key: s.key, label: s.key }))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky save bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${dirtyKeys.length > 0 || savedFlash ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="mx-auto max-w-5xl m-3 sm:m-4">
          <div className="bg-white border border-purple-200 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {savedFlash ? (
                <>
                  <FaCheckCircle className="text-green-500 shrink-0" />
                  <span className="text-sm text-slate-700">Cambios guardados</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 animate-pulse shrink-0" />
                  <span className="text-sm text-slate-700 truncate">
                    {dirtyKeys.length} campo{dirtyKeys.length === 1 ? '' : 's'} sin guardar
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleReset} disabled={saving || dirtyKeys.length === 0}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 text-sm disabled:opacity-30 disabled:cursor-not-allowed">
                <FaUndo size={12} /> Descartar
              </button>
              <button onClick={handleSave} disabled={saving || dirtyKeys.length === 0}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <FaSave className={saving ? 'animate-pulse' : ''} size={14} />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
