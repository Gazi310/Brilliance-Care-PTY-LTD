import { api } from './api.js';

/* Phase 3 admin-ops endpoints (all require an admin token). */

/** Dashboard morning glance: today's jobs, needs-action counters, KPIs. */
export const getAdminStats = () => api.get('/admin/stats', true);

/** Day-by-day schedule: jobs per day + the three bookable windows for `scope`. */
export const getAdminSchedule = ({ start = '', days = 7, scope = 'shop' } = {}) => {
  const params = new URLSearchParams();
  if (start) params.set('start', start);
  if (days) params.set('days', String(days));
  if (scope) params.set('scope', scope);
  const qs = params.toString();
  return api.get(`/admin/schedule${qs ? `?${qs}` : ''}`, true);
};

/** Customers list — registered accounts + guests grouped by phone. */
export const adminListCustomers = (q = '') =>
  api.get(`/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`, true);

/** One customer profile + full order history. `id` may be `guest:<phone>`. */
export const adminGetCustomer = (id) =>
  api.get(`/admin/customers/${encodeURIComponent(id)}`, true);

/** Save the private admin note (registered accounts only). */
export const adminSetCustomerNote = (id, note) =>
  api.put(`/admin/customers/${encodeURIComponent(id)}/note`, { note }, true);
