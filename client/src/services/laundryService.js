import { api } from './api.js';

// Public: list bookable laundry services.
export function getLaundryServices(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  const qs = new URLSearchParams(entries).toString();
  return api.get(`/laundry-services${qs ? `?${qs}` : ''}`);
}

// Admin-only operations (require a valid admin token).
export const createLaundryService = (fields) => api.post('/laundry-services', fields, true);
export const updateLaundryService = (id, fields) => api.put(`/laundry-services/${id}`, fields, true);
export const deleteLaundryService = (id) => api.del(`/laundry-services/${id}`, true);
