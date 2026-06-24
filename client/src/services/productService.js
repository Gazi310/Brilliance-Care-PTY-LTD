import { api } from './api.js';

export function getProducts(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  const qs = new URLSearchParams(entries).toString();
  return api.get(`/products${qs ? `?${qs}` : ''}`);
}

// Admin-only operations (require a valid admin token).
export const setStock = (id, stock, available) =>
  api.patch(`/products/${id}/stock`, { stock, available }, true);

export const updateProduct = (id, fields) => api.put(`/products/${id}`, fields, true);
export const createProduct = (fields) => api.post('/products', fields, true);
export const deleteProduct = (id) => api.del(`/products/${id}`, true);
