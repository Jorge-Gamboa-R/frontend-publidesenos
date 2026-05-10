import { useEffect, useState } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaReply, FaCheck, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { contactService } from '../../services/contact.service';
import { formatDateTime } from '../../utils/format';
import Spinner from '../../components/ui/Spinner';
import type { ContactMessage } from '../../types';

/** Gestor de mensajes de contacto - leer, responder y marcar como leídos */
export default function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    contactService.getMessages().then(data => setMessages(data.messages)).finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await contactService.markAsRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, isRead: true } : null);
    } catch { toast.error('Error'); }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    try {
      const updated = await contactService.reply(selected.id, replyText.trim());
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, reply: updated.reply, repliedAt: updated.repliedAt, isRead: true } : m));
      setSelected(prev => prev ? { ...prev, reply: updated.reply, repliedAt: updated.repliedAt, isRead: true } : null);
      setShowReplyForm(false);
      setReplyText('');
      toast.success('Respuesta enviada al cliente');
    } catch {
      toast.error('Error al enviar la respuesta');
    } finally {
      setSending(false);
    }
  };

  const openReplyForm = () => {
    setShowReplyForm(true);
    setReplyText(`Hola ${selected?.name || ''},\n\nHemos recibido tu mensaje. En breve nos comunicaremos contigo para más detalles.\n\nQuedamos atentos,\nPublidiseños Yoyer`);
  };

  if (loading) return <Spinner size="lg" />;

  const unread = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-700 p-6 lg:p-7 text-white shadow-xl">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-fuchsia-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shadow-inner">
              <FaEnvelope size={20} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Mensajes</h1>
              <p className="text-pink-100 text-sm mt-0.5">Lee y responde mensajes del formulario de contacto</p>
            </div>
          </div>
          {unread > 0 && (
            <span className="bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-xl border border-white/30">
              {unread} sin leer
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista */}
        <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
          {messages.map(msg => (
            <button key={msg.id} onClick={() => { setSelected(msg); setShowReplyForm(false); if (!msg.isRead) handleMarkRead(msg.id); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${selected?.id === msg.id ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md' : 'bg-white border-pink-100/60 shadow-sm hover:shadow-md hover:border-pink-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                {msg.isRead
                  ? <FaEnvelopeOpen className="text-slate-300" size={14} />
                  : <FaEnvelope className="text-pink-600" size={14} />}
                <span className={`text-sm font-semibold ${msg.isRead ? 'text-slate-600' : 'text-slate-800'}`}>{msg.name}</span>
                {msg.repliedAt && <FaCheck className="text-emerald-500 ml-auto" size={12} title="Respondido" />}
              </div>
              <p className="text-sm text-slate-800 font-medium line-clamp-1">{msg.subject}</p>
              <p className="text-xs text-slate-400 mt-1">{formatDateTime(msg.createdAt)}</p>
            </button>
          ))}
          {messages.length === 0 && (
            <div className="bg-white rounded-2xl border border-pink-100/60 shadow-sm p-8 text-center">
              <p className="text-slate-500">No hay mensajes</p>
            </div>
          )}
        </div>

        {/* Detalle */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-2xl p-6 border border-pink-100/60 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800">{selected.subject}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>De: {selected.name} ({selected.email})</span>
                  <span>{formatDateTime(selected.createdAt)}</span>
                </div>
              </div>
              <hr className="mb-4 border-pink-100" />
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>

              {/* Respuesta previa */}
              {selected.reply && (
                <div className="mt-6 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaCheck className="text-emerald-600" size={12} />
                    <span className="text-sm font-semibold text-emerald-700">
                      Respondido el {selected.repliedAt ? formatDateTime(selected.repliedAt) : ''}
                    </span>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap text-sm">{selected.reply}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="mt-6 flex gap-3">
                {!showReplyForm && (
                  <button onClick={openReplyForm}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all">
                    <FaReply /> {selected.reply ? 'Enviar nueva respuesta' : 'Responder'}
                  </button>
                )}
              </div>

              {/* Formulario de respuesta */}
              {showReplyForm && (
                <div className="mt-4 border border-pink-200 rounded-2xl p-4 bg-gradient-to-br from-pink-50/40 to-purple-50/40">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Respuesta para {selected.name} ({selected.email})
                  </label>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    rows={5}
                    placeholder="Escribe tu respuesta aquí..."
                    className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    El correo se enviará desde publidisenosyoyer@gmail.com
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button onClick={handleReply} disabled={sending || !replyText.trim()} translate="no"
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      <FaPaperPlane className={sending ? 'animate-pulse' : ''} />
                      <span>{sending ? 'Enviando...' : 'Enviar respuesta'}</span>
                    </button>
                    <button onClick={() => setShowReplyForm(false)} disabled={sending}
                      className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-pink-100/60 shadow-sm text-center text-slate-400">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-500/30 mb-3">
                <FaEnvelope size={22} />
              </div>
              <p>Selecciona un mensaje para leerlo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
