import api from './api';
import type { CartItem } from '../types';

export const cartService = {
  getCart: () =>
    api.get<CartItem[]>('/cart').then(r => r.data),

  addItem: (data: { productId: string; quantity: number; customText?: string; customImageUrl?: string; selectedColorId?: string }) =>
    api.post<CartItem>('/cart', data).then(r => r.data),

  updateItem: (itemId: string, data: { quantity?: number; customText?: string; customImageUrl?: string }) =>
    api.put<CartItem>(`/cart/${itemId}`, data).then(r => r.data),

  removeItem: (itemId: string) =>
    api.delete(`/cart/${itemId}`).then(r => r.data),

  clearCart: () =>
    api.delete('/cart').then(r => r.data),
};
