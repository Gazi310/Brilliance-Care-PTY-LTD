import { api } from './api.js';

// Public: rolling availability calendar for one scope (shop / laundry / cleaning
// — defaults to shop) over the next `days` days.
export const getDeliverySlots = (days = 14, scope = 'shop') =>
  api.get(`/delivery-slots?days=${days}&scope=${scope}`);

// Admin-only (require a valid admin token).
export const setDeliverySlot = (date, window, available, note = '', scope = 'shop') =>
  api.put('/delivery-slots', { date, window, available, note, scope }, true);

export const setDeliveryDay = (date, available, scope = 'shop') =>
  api.put('/delivery-slots/day', { date, available, scope }, true);
