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
