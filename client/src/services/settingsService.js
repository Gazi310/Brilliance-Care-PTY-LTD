import { api } from './api.js';

// Public: store settings the storefront needs (currently the delivery fee).
export const getSettings = () => api.get('/settings');

// Admin-only: update the flat per-visit delivery fee.
export const updateSettings = (fields) => api.put('/settings', fields, true);
