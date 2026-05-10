import api from './api';
import type { ContactMessage, Pagination } from '../types';

export const contactService = {
  send: (data: { name: string; email: string; phone: string; subject: string; message: string; recaptchaToken?: string | null }) =>
    api.post('/contact', data).then(r => r.data),

  // Admin
  getMessages: (page = 1, read?: boolean) =>
    api.get<{ messages: ContactMessage[]; pagination: Pagination }>('/contact/admin', { params: { page, read } }).then(r => r.data),

  markAsRead: (id: string) =>
    api.put(`/contact/admin/${id}/read`).then(r => r.data),

  reply: (id: string, reply: string) =>
    api.post<ContactMessage>(`/contact/admin/${id}/reply`, { reply }).then(r => r.data),
};
