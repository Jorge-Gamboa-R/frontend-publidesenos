import api from './api';
import type { Product, Pagination } from '../types';

interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sort?: string;
  featured?: boolean;
}

export const productService = {
  getProducts: (filters: ProductFilters = {}) =>
    api.get<ProductsResponse>('/products', { params: filters }).then(r => r.data),

  getFeatured: () =>
    api.get<Product[]>('/products/featured').then(r => r.data),

  getBySlug: (slug: string) =>
    api.get<Product>(`/products/${slug}`).then(r => r.data),

  getById: (id: string) =>
    api.get<Product>(`/products/by-id/${id}`).then(r => r.data),

  create: (data: any) =>
    api.post<Product>('/products', data).then(r => r.data),

  update: (id: string, data: any) =>
    api.put<Product>(`/products/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/products/${id}`).then(r => r.data),

  addImage: (productId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  deleteImage: (productId: string, imageId: string) =>
    api.delete(`/products/${productId}/images/${imageId}`).then(r => r.data),

  setPrimaryImage: (productId: string, imageId: string) =>
    api.put(`/products/${productId}/images/${imageId}/primary`).then(r => r.data),

  addVideo: (productId: string, file: File, title?: string) => {
    const formData = new FormData();
    formData.append('video', file);
    if (title) formData.append('title', title);
    return api.post(`/products/${productId}/videos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  deleteVideo: (productId: string, videoId: string) =>
    api.delete(`/products/${productId}/videos/${videoId}`).then(r => r.data),

  addColor: (productId: string, file: File, colorName: string) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('colorName', colorName);
    return api.post(`/products/${productId}/colors`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  deleteColor: (productId: string, colorId: string) =>
    api.delete(`/products/${productId}/colors/${colorId}`).then(r => r.data),
};
