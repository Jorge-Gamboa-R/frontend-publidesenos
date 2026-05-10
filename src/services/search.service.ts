import api from './api';
import type { Product, Pagination } from '../types';

interface SearchResponse {
  products: Product[];
  pagination: Pagination;
}

export const searchService = {
  search: (params: { q?: string; category?: string; minPrice?: number; maxPrice?: number; minRating?: number; page?: number }) =>
    api.get<SearchResponse>('/search', { params }).then(r => r.data),

  suggestions: (q: string) =>
    api.get<{ name: string; slug: string }[]>('/search/suggestions', { params: { q } }).then(r => r.data),
};
