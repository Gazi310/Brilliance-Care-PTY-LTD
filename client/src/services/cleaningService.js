import { api } from './api.js';

// Public: list bookable cleaning services.
export function getCleaningServices(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  const qs = new URLSearchParams(entries).toString();
  return api.get(`/cleaning-services${qs ? `?${qs}` : ''}`);
}

// Admin-only operations (require a valid admin token).
export const createCleaningService = (fields) => api.post('/cleaning-services', fields, true);
export const updateCleaningService = (id, fields) => api.put(`/cleaning-services/${id}`, fields, true);
export const deleteCleaningService = (id) => api.del(`/cleaning-services/${id}`, true);
