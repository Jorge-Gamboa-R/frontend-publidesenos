import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaCheckCircle, FaExclamationCircle, FaTrash, FaPalette } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';
import { ACCENT_LABELS, ACCENT_PALETTES, applyAccent } from '../../theme/accent';
import type { ThemeAccent } from '../../types';

const ACCENTS: ThemeAccent[] = ['purple', 'blue', 'green', 'pink'];

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    birthday: user?.birthday ? user.birthday.slice(0, 10) : '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resending, setResending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      toast.error('Ingresa un número de celular válido');
      return;
    }
    setLoading(true);
    try {
      const updated = await authService.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        birthday: form.birthday || null,
      });
      setUser(updated);
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede pesar más de 5 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Selecciona una imagen válida');
      return;
    }
    setUploadingAvatar(true);
    try {
      const { url } = await authService.uploadAvatar(file);
      const updated = await authService.updateProfile({ avatarUrl: url });
      setUser(updated);
      toast.success('Foto actualizada');
    } catch {
      toast.error('Error al subir la foto');
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatarUrl) return;
    setUploadingAvatar(true);
    try {
      const updated = await authService.updateProfile({ avatarUrl: null });
      setUser(updated);
      toast.success('Foto eliminada');
    } catch {
      toast.error('Error al eliminar la foto');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAccentChange = async (accent: ThemeAccent) => {
    applyAccent(accent);
    try {
      const updated = await authService.updateProfile({ themeAccent: accent });
      setUser(updated);
      toast.success(`Color cambiado a ${ACCENT_LABELS[accent]}`);
    } catch {
      toast.error('No se pudo guardar el color');
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await authService.resendVerification();
      toast.success('Correo de verificación enviado');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'No se pudo reenviar');
    } finally {
      setResending(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Contraseña cambiada');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'ELIMINAR') {
      toast.error('Escribe ELIMINAR para confirmar');
      return;
    }
    setDeleting(true);
    try {
      await authService.deleteAccount();
      await logout();
      toast.success('Cuenta eliminada');
      navigate('/');
    } catch {
      toast.error('No se pudo eliminar la cuenta');
      setDeleting(false);
    }
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>

      {/* Avatar */}
      <section className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
        <h2 className="font-bold text-white mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.firstName}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-500/50" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-secondary-500 text-white flex items-center justify-center text-3xl font-bold border-4 border-primary-500/50">
                {initials || '?'}
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg disabled:opacity-50">
              <FaCamera size={12} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-purple-300/70 mb-2">JPG o PNG, máximo 5 MB. Se recorta a 400×400.</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
                {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
              </button>
              {user?.avatarUrl && (
                <button type="button" onClick={handleRemoveAvatar} disabled={uploadingAvatar}
                  className="text-sm bg-purple-900/50 hover:bg-purple-800/50 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
                  Quitar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Verificación de email */}
      <section className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
        <h2 className="font-bold text-white mb-3">Correo electrónico</h2>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-purple-200">{user?.email}</span>
          {user?.emailVerified ? (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">
              <FaCheckCircle size={12} /> Verificado
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                <FaExclamationCircle size={12} /> Sin verificar
              </span>
              <button onClick={handleResendVerification} disabled={resending}
                className="text-sm text-primary-400 hover:underline disabled:opacity-50">
                {resending ? 'Enviando...' : 'Reenviar correo de verificación'}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Información personal */}
      <form onSubmit={handleUpdate} className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30 space-y-4">
        <h2 className="font-bold text-white">Información personal</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">Nombre</label>
            <input type="text" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-1">Apellido</label>
            <input type="text" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-1">Celular</label>
          <input type="tel" required inputMode="tel" pattern="[0-9+\-\s()]{7,20}" placeholder="Ej: 3001234567"
            value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-1">Fecha de cumpleaños</label>
          <input type="date" value={form.birthday}
            onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <p className="text-xs text-purple-300/50 mt-1">Lo usaremos para enviarte un descuento en tu mes.</p>
        </div>
        <button type="submit" disabled={loading}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-purple-900/50 disabled:cursor-not-allowed">
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>

      {/* Tema visual */}
      <section className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
        <h2 className="font-bold text-white flex items-center gap-2 mb-1"><FaPalette /> Color de acento</h2>
        <p className="text-sm text-purple-300/60 mb-4">Cambia el color principal de los botones y enlaces.</p>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map(accent => {
            const palette = ACCENT_PALETTES[accent];
            const active = (user?.themeAccent || 'purple') === accent;
            return (
              <button key={accent} type="button" onClick={() => handleAccentChange(accent)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${active ? 'border-white' : 'border-purple-700/40 hover:border-purple-400/60'}`}>
                <span className="w-5 h-5 rounded-full" style={{ background: palette[600] }} />
                <span className="text-sm text-white">{ACCENT_LABELS[accent]}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Cambiar contraseña */}
      {user?.authProvider === 'local' && (
        <form onSubmit={handleChangePassword} className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30 space-y-4">
          <h2 className="font-bold text-white">Cambiar Contraseña</h2>
          <input type="password" placeholder="Contraseña actual" required value={pwForm.currentPassword}
            onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <input type="password" placeholder="Nueva contraseña" required minLength={8} value={pwForm.newPassword}
            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <input type="password" placeholder="Confirmar nueva contraseña" required value={pwForm.confirmPassword}
            onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
            className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          <button type="submit" className="bg-purple-900/50 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-800/50">
            Cambiar Contraseña
          </button>
        </form>
      )}

      {/* Eliminar cuenta */}
      <section className="bg-red-950/30 rounded-xl p-6 border border-red-800/40">
        <h2 className="font-bold text-red-300 flex items-center gap-2"><FaTrash /> Eliminar cuenta</h2>
        <p className="text-sm text-red-200/70 mt-2 mb-4">
          Tus datos personales serán anonimizados. Tus pedidos se conservan por motivos fiscales pero ya no estarán asociados a ti.
        </p>
        <button onClick={() => setDeleteOpen(true)}
          className="bg-red-700/60 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
          Eliminar mi cuenta
        </button>
      </section>

      {deleteOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-950 border border-red-800/60 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar cuenta?</h3>
            <p className="text-sm text-purple-200/80 mb-4">
              Esta acción no se puede deshacer. Para confirmar, escribe <strong>ELIMINAR</strong>.
            </p>
            <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/40 rounded-lg mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}
                className="px-4 py-2 rounded-lg bg-purple-900/50 text-white text-sm hover:bg-purple-800/50">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting || deleteConfirm !== 'ELIMINAR'}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50">
                {deleting ? 'Eliminando...' : 'Eliminar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
