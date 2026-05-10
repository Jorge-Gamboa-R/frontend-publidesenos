import api from './api';
import type { Order, Pagination } from '../types';

interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export const orderService = {
  create: (data: { addressId: string; notes?: string; paymentMethod: string }) =>
    api.post<Order>('/orders', data).then(r => r.data),

  getUserOrders: (page = 1, limit = 10) =>
    api.get<OrdersResponse>('/orders', { params: { page, limit } }).then(r => r.data),

  getById: (id: string) =>
    api.get<Order>(`/orders/${id}`).then(r => r.data),

  cancel: (id: string) =>
    api.post<Order>(`/orders/${id}/cancel`).then(r => r.data),

  // Admin
  getAllOrders: (page = 1, limit = 20, status?: string) =>
    api.get<OrdersResponse>('/orders/admin/all', { params: { page, limit, status } }).then(r => r.data),

  updateStatus: (id: string, status: string, extra?: { trackingNumber?: string | null }) =>
    api.put(`/orders/admin/${id}/status`, { status, ...(extra || {}) }).then(r => r.data),

  updateEstimatedDelivery: (id: string, estimatedDeliveryDate: string | null) =>
    api.put(`/orders/admin/${id}/status`, { estimatedDeliveryDate }).then(r => r.data),
};
