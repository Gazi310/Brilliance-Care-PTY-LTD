import { api } from './api.js';

// items: [{ productId, qty }]
export const checkout = (items) => api.post('/orders', { items });
