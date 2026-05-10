import api from './api';
import type { AdminDashboardStats } from '../types';

export const adminService = {
  getDashboardStats: () =>
    api.get<AdminDashboardStats>('/admin/dashboard').then(r => r.data),

  getCustomers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/admin/customers', { params }).then(r => r.data),

  getCustomerDetail: (id: string) =>
    api.get(`/admin/customers/${id}`).then(r => r.data),

  deleteCustomer: (id: string) =>
    api.delete(`/admin/customers/${id}`).then(r => r.data),
};
