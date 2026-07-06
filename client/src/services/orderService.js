import { api } from './api.js';

// Reduce a rich slot object down to what the API needs.
const slim = (s) => (s ? { date: s.date, window: s.window } : null);

/**
 * Place an order for products and/or laundry and/or cleaning services.
 * @param {object} p
 * @param {Array<{id,qty}>} p.products
 * @param {Array<{id,qty}>} p.laundry
 * @param {Array<{id,qty}>} p.cleaning
 * @param {object|null} p.deliverySlot       product delivery window
 * @param {object|null} p.laundryPickupSlot  laundry collection window
 * @param {object|null} p.laundryReturnSlot  laundry return window
 * @param {object|null} p.cleaningSlot        cleaning appointment window
 */
export const checkout = ({
  products = [],
  laundry = [],
  cleaning = [],
  deliverySlot = null,
  laundryPickupSlot = null,
  laundryReturnSlot = null,
  cleaningSlot = null,
} = {}) =>
  api.post('/orders', {
    items: products.map((i) => ({ productId: i.id, qty: i.qty })),
    laundryItems: laundry.map((i) => ({ serviceId: i.id, qty: i.qty })),
    cleaningItems: cleaning.map((i) => ({ serviceId: i.id, qty: i.qty })),
    deliverySlot: slim(deliverySlot),
    laundryPickupSlot: slim(laundryPickupSlot),
    laundryReturnSlot: slim(laundryReturnSlot),
    cleaningSlot: slim(cleaningSlot),
  });

/* ------------------------------------------------------------------ */
/*  Admin — the orders work queue + assess → invoice → balance loop.   */
/* ------------------------------------------------------------------ */

/** List orders for the admin queue. Filters: segment, q (search), kind. */
export const adminListOrders = ({ segment = 'all', q = '', kind = '' } = {}) => {
  const params = new URLSearchParams();
  if (segment && segment !== 'all') params.set('segment', segment);
  if (q) params.set('q', q);
  if (kind) params.set('kind', kind);
  const qs = params.toString();
  return api.get(`/orders${qs ? `?${qs}` : ''}`, true);
};

/** Advance an order through its lifecycle (admin). */
export const adminUpdateStatus = (orderId, status) =>
  api.patch(`/orders/${orderId}/status`, { status }, true);

/**
 * Save the assessed ACTUALS for a booking (admin).
 * @param {object} p
 * @param {Array<{index,actualQty,actualUnitPrice}>} p.lines   per booked line
 * @param {Array<{label,unit,qty,unitPrice,kind,note}>} p.extras  added on site
 * @param {string} p.note  "why it changed" — shown on the invoice
 */
export const adminAssessOrder = (orderId, { lines = [], extras = [], note = '' } = {}) =>
  api.post(`/orders/${orderId}/assess`, { lines, extras, note }, true);

/** Generate the final invoice and "send" it on the chosen channels (admin). */
export const adminCreateInvoice = (orderId, { channels = ['email'], note = '' } = {}) =>
  api.post(`/orders/${orderId}/invoice`, { channels, note }, true);

/** Record an on-delivery balance payment: 'cash' | 'card' | 'waive' (admin). */
export const adminRecordBalance = (orderId, method) =>
  api.post(`/orders/${orderId}/record-balance`, { method }, true);
