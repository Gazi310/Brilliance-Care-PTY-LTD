import { api } from './api.js';

// Public: rolling availability calendar for the next `days` days.
export const getDeliverySlots = (days = 14) => api.get(`/delivery-slots?days=${days}`);

// Admin-only (require a valid admin token).
export const setDeliverySlot = (date, window, available, note = '') =>
  api.put('/delivery-slots', { date, window, available, note }, true);

export const setDeliveryDay = (date, available) =>
  api.put('/delivery-slots/day', { date, available }, true);
