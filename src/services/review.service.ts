import api from './api';
import type { Review, Pagination } from '../types';

interface ReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
}

export const reviewService = {
  getProductReviews: (productId: string, page = 1) =>
    api.get<ReviewsResponse>(`/reviews/product/${productId}`, { params: { page } }).then(r => r.data),

  create: (data: { productId: string; rating: number; comment?: string }) =>
    api.post<Review>('/reviews', data).then(r => r.data),

  getEligibility: (productId: string) =>
    api.get<{ eligible: boolean; hasReviewed: boolean; hasDelivered: boolean }>(
      `/reviews/eligibility/${productId}`
    ).then(r => r.data),

  update: (id: string, data: { rating?: number; comment?: string }) =>
    api.put<Review>(`/reviews/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/reviews/${id}`).then(r => r.data),

  // Admin
  getAll: (page = 1, approved?: boolean) =>
    api.get<ReviewsResponse>('/reviews/admin/all', { params: { page, approved } }).then(r => r.data),

  approve: (id: string) =>
    api.put(`/reviews/admin/${id}/approve`).then(r => r.data),
};
