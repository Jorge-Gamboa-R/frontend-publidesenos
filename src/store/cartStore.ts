/**
 * Store del carrito de compras con Zustand.
 * Sincroniza con el backend cuando el usuario está autenticado.
 */
import { create } from 'zustand';
import { cartService } from '../services/cart.service';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (data: { productId: string; quantity: number; customText?: string; customImageUrl?: string; selectedColorId?: string }) => Promise<void>;
  updateItem: (itemId: string, data: { quantity?: number }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: () => number;
  total: () => number;
  tax: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const items = await cartService.getCart();
      set({ items, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (data) => {
    const item = await cartService.addItem(data);
    const items = get().items;
    const existing = items.findIndex(i => i.id === item.id);
    if (existing >= 0) {
      const updated = [...items];
      updated[existing] = item;
      set({ items: updated });
    } else {
      set({ items: [...items, item] });
    }
  },

  updateItem: async (itemId, data) => {
    const item = await cartService.updateItem(itemId, data);
    set({ items: get().items.map(i => i.id === itemId ? item : i) });
  },

  removeItem: async (itemId) => {
    await cartService.removeItem(itemId);
    set({ items: get().items.filter(i => i.id !== itemId) });
  },

  clearCart: async () => {
    await cartService.clearCart();
    set({ items: [] });
  },

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  total: () => get().items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0),

  tax: () =>
    get().items.reduce((sum, item) => {
      const rate = Number(item.product?.taxRate ?? 0);
      return sum + Number(item.unitPrice) * item.quantity * rate;
    }, 0),
}));
