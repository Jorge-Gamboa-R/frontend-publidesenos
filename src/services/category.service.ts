import api from './api';
import type { Category } from '../types';

export const categoryService = {
  getAll: () =>
    api.get<Category[]>('/categories').then(r => r.data),

  getBySlug: (slug: string) =>
    api.get<Category>(`/categories/${slug}`).then(r => r.data),

  create: (data: any) =>
    api.post<Category>('/categories', data).then(r => r.data),

  update: (id: string, data: any) =>
    api.put<Category>(`/categories/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`).then(r => r.data),
};
