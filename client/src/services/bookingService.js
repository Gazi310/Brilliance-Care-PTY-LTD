import { api } from './api.js';

// Reduce a rich slot object down to what the API needs.
const slim = (s) => (s ? { date: s.date, window: s.window } : null);

/**
 * Create a service booking (laundry and/or cleaning) — blueprint §4.5.
 * The server recomputes the estimate, GST and deposit authoritatively.
 *
 * @param {object} draft
 * @param {Array<{serviceId,qty}>} draft.laundry
 * @param {object|null} draft.cleaning  { serviceId, bedrooms, bathrooms, qty, addons:[{serviceId,qty}] }
 * @param {object|null} draft.pickupSlot / returnSlot / cleaningSlot
 * @param {object} draft.address  { line1, suburb, state, postcode }
 * @param {object} draft.contact  { name, phone }
 */
export const createBooking = ({
  laundry = [],
  cleaning = null,
  pickupSlot = null,
  returnSlot = null,
  cleaningSlot = null,
  address = {},
  contact = {},
  accessNotes = '',
  specialInstructions = '',
} = {}) =>
  api.post(
    '/bookings',
    {
      laundry,
      cleaning,
      pickupSlot: slim(pickupSlot),
      returnSlot: slim(returnSlot),
      cleaningSlot: slim(cleaningSlot),
      address,
      contact,
      accessNotes,
      specialInstructions,
    },
    true
  );

/**
 * Pay the booking deposit. Mock provider for now — card details are validated
 * for shape only (any number works; ending in 0002 simulates a decline).
 * When Stripe lands, this call is replaced by Stripe.js confirm + verify.
 */
export const payDeposit = (orderId, card) =>
  api.post(`/bookings/${orderId}/pay-deposit`, { card }, true);

/** Fetch one order/booking (owner or admin). */
export const getOrder = (orderId) => api.get(`/orders/${orderId}`, true);

/** Fetch the signed-in user's orders & bookings, newest first. */
export const getMyOrders = () => api.get('/orders/mine', true);
