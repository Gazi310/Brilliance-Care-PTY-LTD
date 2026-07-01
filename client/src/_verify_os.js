import { api } from './services/api.js';

// items: [{ productId, qty }]; deliverySlot: { date, window } | null
export const checkout = (items, deliverySlot = null) =>
  api.post('/orders', { items, deliverySlot });
