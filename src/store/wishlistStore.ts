import { create } from 'zustand';
import { wishlistService } from '../services/wishlist.service';

interface WishlistState {
  ids: Set<string>;
  count: number;
  fetchWishlist: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: new Set(),
  count: 0,

  fetchWishlist: async () => {
    try {
      const items = await wishlistService.getWishlist();
      const ids = new Set(items.map(i => i.productId));
      set({ ids, count: ids.size });
    } catch {
      // not authenticated
    }
  },

  add: async (productId) => {
    await wishlistService.add(productId);
    const ids = new Set(get().ids);
    ids.add(productId);
    set({ ids, count: ids.size });
  },

  remove: async (productId) => {
    await wishlistService.remove(productId);
    const ids = new Set(get().ids);
    ids.delete(productId);
    set({ ids, count: ids.size });
  },

  toggle: async (productId) => {
    if (get().ids.has(productId)) {
      await get().remove(productId);
    } else {
      await get().add(productId);
    }
  },

  has: (productId) => get().ids.has(productId),

  clear: () => set({ ids: new Set(), count: 0 }),
}));
