import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { addressService } from '../services/address.service';
import { authService } from '../services/auth.service';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { formatPrice } from '../utils/format';
import { COLOMBIA_DEPARTMENTS, citiesOf } from '../data/colombiaLocations';
import type { Address } from '../types';

/**
 * Página de checkout - selección de dirección, método de pago y confirmación de orden.
 */
export default function Checkout() {
  const { items, total, tax: cartTax, fetchCart } = useCartStore();
  const { user, setUser } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', state: '', postalCode: '', isDefault: false });
  const [phoneInput, setPhoneInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const needsPhone = !user?.phone || user.phone.replace(/\D/g, '').length < 7;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    addressService.getAll().then(addr => {
      setAddresses(addr);
      const def = addr.find(a => a.isDefault);
      if (def) setSelectedAddress(def.id);
    });
  }, []);

  const handleCreateAddress = async () => {
    try {
      const addr = await addressService.create({ ...newAddress, country: 'Colombia' });
      setAddresses(prev => [...prev, addr]);
      setSelectedAddress(addr.id);
      setShowNewAddress(false);
      setNewAddress({ label: '', street: '', city: '', state: '', postalCode: '', isDefault: false });
      toast.success('Dirección agregada');
    } catch {
      toast.error('Error al crear dirección');
    }
  };

  const handleSavePhone = async () => {
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length < 7) {
      toast.error('Ingresa un número de celular válido');
      return;
    }
    setSavingPhone(true);
    try {
      const updated = await authService.updateProfile({ phone: phoneInput });
      setUser(updated);
      toast.success('Celular guardado');
    } catch {
      toast.error('No se pudo guardar el celular');
    } finally {
      setSavingPhone(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (needsPhone) {
      toast.error('Agrega tu número de celular antes de continuar');
      return;
    }
    if (!selectedAddress) {
      toast.error('Selecciona una dirección de envío');
      return;
    }
    setLoading(true);
    let createdOrderId: string | null = null;
    try {
      const order = await orderService.create({
        addressId: selectedAddress,
        notes: notes || undefined,
        paymentMethod,
      });
      createdOrderId = order.id;
      toast.success(`Orden ${order.orderNumber} creada`);

      // El backend vacía el carrito al crear la orden; sincronizamos el store
      // para que el contador del header baje a 0 inmediatamente.
      await fetchCart();

      if (paymentMethod === 'cash_on_delivery') {
        navigate(`/mi-cuenta/pedidos/${order.id}`);
        return;
      }

      const { checkoutUrl } = await paymentService.getCheckoutUrl(order.id);
      // Abrimos Wompi en pestaña nueva y llevamos la actual a la página de resultado
      // que hace polling a /verify para detectar el pago sin depender del webhook
      // (útil en dev: Wompi no puede alcanzar localhost).
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      navigate(`/pago/resultado?orderId=${order.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Error al procesar el pago';
      toast.error(msg, { duration: 6000 });
      // Si la orden ya se creó pero falló la pasarela, llevamos al usuario a su pedido
      // para que pueda reintentar el pago o cambiar de método más adelante.
      if (createdOrderId) {
        setTimeout(() => navigate(`/mi-cuenta/pedidos/${createdOrderId}`), 1500);
      } else {
        setLoading(false);
      }
    }
  };

  const subtotal = total();
  const shipping = subtotal >= 150000 ? 0 : 12000;
  const tax = cartTax();
  const grandTotal = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Tu carrito está vacío</h1>
        <a href="/catalogo" className="text-primary-400 hover:underline">Ir al catálogo</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {needsPhone && (
            <div className="bg-amber-500/10 border border-amber-400/40 rounded-xl p-6">
              <h2 className="text-lg font-bold text-amber-200 mb-2">Número de celular requerido</h2>
              <p className="text-sm text-amber-100/80 mb-4">
                Para continuar con tu pedido necesitamos un número de celular para coordinar la entrega.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+\-\s()]{7,20}"
                  placeholder="Ej: 3001234567"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  className="flex-1 px-4 py-2 bg-purple-950/50 border border-amber-400/40 text-white placeholder-amber-200/40 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
                <button
                  onClick={handleSavePhone}
                  disabled={savingPhone}
                  className="bg-amber-500 text-slate-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingPhone ? 'Guardando...' : 'Guardar celular'}
                </button>
              </div>
            </div>
          )}

          {/* Dirección */}
          <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
            <h2 className="text-lg font-bold text-white mb-4">Dirección de envío</h2>
            {addresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-primary-500 bg-primary-600/10' : 'border-purple-700/40 hover:border-purple-600/50'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                    <div>
                      <p className="font-medium text-white">{addr.label || 'Dirección'}</p>
                      <p className="text-sm text-purple-300/60">{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {!showNewAddress ? (
              <button onClick={() => setShowNewAddress(true)} className="text-primary-400 text-sm font-medium hover:underline">
                + Agregar nueva dirección
              </button>
            ) : (
              <div className="space-y-3 border-t border-purple-800/30 pt-4">
                <input placeholder="Etiqueta (ej: Casa)" value={newAddress.label}
                  onChange={e => setNewAddress(p => ({ ...p, label: e.target.value }))}
                  className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg text-sm" />
                <input placeholder="Dirección" required value={newAddress.street}
                  onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))}
                  className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <select required value={newAddress.state}
                    onChange={e => setNewAddress(p => ({ ...p, state: e.target.value, city: '' }))}
                    className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg text-sm">
                    <option value="">Departamento</option>
                    {COLOMBIA_DEPARTMENTS.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                  <select required value={newAddress.city} disabled={!newAddress.state}
                    onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/40 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    <option value="">{newAddress.state ? 'Ciudad' : 'Elige el departamento'}</option>
                    {citiesOf(newAddress.state).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <input placeholder="Código postal" required value={newAddress.postalCode}
                  onChange={e => setNewAddress(p => ({ ...p, postalCode: e.target.value }))}
                  className="w-full px-4 py-2 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg text-sm" />
                <div className="flex gap-3">
                  <button onClick={handleCreateAddress} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">Guardar</button>
                  <button onClick={() => setShowNewAddress(false)} className="text-purple-300/60 text-sm hover:text-slate-300">Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {/* Método de pago */}
          <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
            <h2 className="text-lg font-bold text-white mb-4">Método de pago</h2>
            <div className="space-y-3">
              {[
                {
                  value: 'credit_card',
                  label: 'Tarjeta crédito, débito o PSE',
                  description: 'Pago en línea seguro con Wompi (todas las tarjetas y PSE).',
                },
                {
                  value: 'cash_on_delivery',
                  label: 'Pago contra entrega',
                  description: 'Paga al recibir tu pedido.',
                },
              ].map(method => (
                <label key={method.value} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === method.value ? 'border-primary-500 bg-primary-600/10' : 'border-purple-700/40 hover:border-purple-600/50'}`}>
                  <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)} className="mt-1" />
                  <div>
                    <p className="font-medium text-sm text-purple-100">{method.label}</p>
                    <p className="text-xs text-purple-300/60 mt-0.5">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30">
            <h2 className="text-lg font-bold text-white mb-4">Notas (opcional)</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Instrucciones especiales para tu pedido..."
              className="w-full px-4 py-3 bg-purple-950/50 border border-purple-700/40 text-white placeholder-purple-300/50 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-700/30 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-white mb-4">Resumen</h2>
          <div className="space-y-3 mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-purple-300/60">{item.product.name} x{item.quantity}</span>
                <span className="text-purple-100">{formatPrice(Number(item.unitPrice) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="my-3 border-purple-800/30" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-purple-300/60">Subtotal</span><span className="text-purple-100">{formatPrice(subtotal)}</span></div>
            {tax > 0 && (
              <div className="flex justify-between"><span className="text-purple-300/60">IVA</span><span className="text-purple-100">{formatPrice(tax)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-purple-300/60">Envío</span><span className="text-purple-100">{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span></div>
            <hr className="border-purple-800/30" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total</span><span className="text-primary-400">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button onClick={handlePlaceOrder} disabled={loading || needsPhone}
            className="mt-6 w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">
            {loading ? 'Procesando...' : needsPhone ? 'Agrega tu celular para continuar' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
