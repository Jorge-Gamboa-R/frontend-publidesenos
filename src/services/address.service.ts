import api from './api';
import type { Address } from '../types';

export const addressService = {
  getAll: () =>
    api.get<Address[]>('/addresses').then(r => r.data),

  create: (data: Omit<Address, 'id' | 'userId'>) =>
    api.post<Address>('/addresses', data).then(r => r.data),

  update: (id: string, data: Partial<Address>) =>
    api.put<Address>(`/addresses/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/addresses/${id}`).then(r => r.data),
};
