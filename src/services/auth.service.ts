import api from './api';
import type { AuthResponse, ThemeAccent, User, UserStats } from '../types';

type ProfileUpdatePayload = Partial<{
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string | null;
  birthday: string | null;
  themeAccent: ThemeAccent | null;
}>;

export const authService = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; recaptchaToken?: string | null }) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string; recaptchaToken?: string | null }) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  logout: () => api.post('/auth/logout').then(r => r.data),

  getMe: () => api.get<User>('/auth/me').then(r => r.data),

  getMyStats: () => api.get<UserStats>('/auth/me/stats').then(r => r.data),

  updateProfile: (data: ProfileUpdatePayload) =>
    api.put<User>('/auth/profile', data).then(r => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data).then(r => r.data),

  forgotPassword: (email: string, recaptchaToken?: string | null) =>
    api.post('/auth/forgot-password', { email, recaptchaToken }).then(r => r.data),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }).then(r => r.data),

  googleExchange: (code: string) =>
    api.post<AuthResponse>('/auth/google/exchange', { code }).then(r => r.data),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post<{ url: string; publicId: string }>('/upload/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  verifyEmail: (token: string) =>
    api.get<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`).then(r => r.data),

  resendVerification: () =>
    api.post<{ message: string }>('/auth/resend-verification').then(r => r.data),

  deleteAccount: () =>
    api.delete<{ message: string }>('/auth/me').then(r => r.data),
};
