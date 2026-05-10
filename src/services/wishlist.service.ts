import api from './api';
import type { WishlistItem } from '../types';

export const wishlistService = {
  getWishlist: () =>
    api.get<WishlistItem[]>('/wishlist').then(r => r.data),

  add: (productId: string) =>
    api.post<WishlistItem>('/wishlist', { productId }).then(r => r.data),

  remove: (productId: string) =>
    api.delete(`/wishlist/${productId}`).then(r => r.data),
};
