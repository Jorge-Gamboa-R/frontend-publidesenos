import { useRef, useState } from 'react';
import { FaEnvelope, FaPhone, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { contactService } from '../services/contact.service';
import RecaptchaWidget, { isRecaptchaEnabled, type RecaptchaWidgetHandle } from '../components/ui/RecaptchaWidget';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<RecaptchaWidgetHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }
    if (phoneDigits.length < 7) {
      toast.error('Ingresa un número de celular válido');
      return;
    }
    setLoading(true);
    try {
      let token: string | null = null;
      if (isRecaptchaEnabled()) {
        token = (await recaptchaRef.current?.executeAsync()) ?? null;
        if (!token) {
          toast.error('Verificación reCAPTCHA fallida');
          setLoading(false);
          return;
        }
      }
      await contactService.send({ ...form, recaptchaToken: token });
      toast.success('Mensaje enviado correctamente');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      recaptchaRef.current?.reset();
    } catch {
      recaptchaRef.current?.reset();
      toast.error('Error al enviar mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold text-white text-center mb-4">Contáctanos</h1>
      <p className="text-purple-300/70 text-center mb-12 max-w-2xl mx-auto">
        ¿Tienes alguna pregunta o quieres un presupuesto personalizado? Estamos aquí para ayudarte.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info */}
        <div className="space-y-6">
          <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full text-green-400"><FaWhatsapp size={20} /></div>
              <div>
                <h3 className="font-semibold text-white">WhatsApp</h3>
                <a href="https://wa.me/573502362979" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-400 hover:underline">
                  350 236 2979
                </a>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600/20 rounded-full text-primary-400"><FaPhone size={20} /></div>
              <div>
                <h3 className="font-semibold text-white">Teléfono</h3>
                <p className="text-sm text-purple-300/60">350 236 2979</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600/20 rounded-full text-primary-400"><FaEnvelope size={20} /></div>
              <div>
                <h3 className="font-semibold text-white">Email</h3>
                <p className="text-sm text-purple-300/60">publidisenosyoyer@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600/20 rounded-full text-primary-400"><FaMapMarkerAlt size={20} /></div>
              <div>
                <h3 className="font-semibold text-white">Ubicación</h3>
                <p className="text-sm text-purple-300/60">Colombia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-purple-950/50 rounded-2xl p-8 border border-purple-700/30 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Número de celular <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              inputMode="tel"
              pattern="[0-9+\-\s()]{7,20}"
              required
              value={form.phone}
              placeholder="Ej: 3001234567"
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Asunto <span className="text-red-400">*</span>
            </label>
            <input type="text" required value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">
              Mensaje <span className="text-red-400">*</span>
            </label>
            <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <p className="text-xs text-purple-300/60">Todos los campos son obligatorios.</p>
          <RecaptchaWidget ref={recaptchaRef} />
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:from-gray-400 disabled:to-gray-400 transition-all">
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </button>
        </form>
      </div>
    </div>
  );
}
