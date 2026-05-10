/**
 * Store de autenticación con Zustand.
 * Maneja el estado del usuario, login, registro y logout.
 */
import { create } from 'zustand';
import { authService } from '../services/auth.service';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, recaptchaToken?: string | null) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; recaptchaToken?: string | null }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password, recaptchaToken) => {
    const { user, accessToken } = await authService.login({ email, password, recaptchaToken });
    localStorage.setItem('accessToken', accessToken);
    set({ user, isAuthenticated: true });
  },

  register: async (data) => {
    const { user, accessToken } = await authService.register(data);
    localStorage.setItem('accessToken', accessToken);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    localStorage.removeItem('accessToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token);
  },
}));
