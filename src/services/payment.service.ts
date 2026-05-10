import api from './api';

export const paymentService = {
  getCheckoutUrl: (orderId: string) =>
    api.post<{ checkoutUrl: string }>('/payments/checkout-url', { orderId }).then(r => r.data),

  getStatus: (orderId: string) =>
    api.get(`/payments/${orderId}`).then(r => r.data),

  verify: (orderId: string) =>
    api.post<{ status: string; payment: any; transaction?: any }>(`/payments/${orderId}/verify`).then(r => r.data),
};
