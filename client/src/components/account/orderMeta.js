/* ------------------------------------------------------------------ */
/*  Shared vocabulary for the customer's order list.                    */
/*                                                                      */
/*  The card and the past-orders table have to agree on what a status   */
/*  is called and what colour it is, or the same order reads as two     */
/*  different things depending on which tab you're on. Plain `.js` so   */
/*  it can be imported anywhere without tripping Fast Refresh.          */
/* ------------------------------------------------------------------ */

/**
 * Status → [Tag tone, label].
 *
 * Tone is chosen by *who is waiting*, not by how far along the order is:
 *   bad   the customer is blocking it (unpaid deposit, cancelled slot)
 *   warn  we're waiting on someone, or money is owed
 *   info  we're working on it — nothing for them to do
 *   ok    settled
 */
export const STATUS_META = {
  // booking lifecycle
  booked: ['bad', 'Deposit unpaid'],
  deposit_paid: ['info', 'Deposit paid'],
  scheduled: ['info', 'Scheduled'],
  picked_up: ['info', 'Picked up'],
  in_progress: ['info', 'In progress'],
  assessed: ['info', 'Assessed'],
  ready: ['info', 'Ready'],
  out_for_delivery: ['info', 'On the way'],
  delivered: ['ok', 'Delivered'],
  // shared / shop
  pending: ['warn', 'Pending'],
  paid: ['ok', 'Paid'],
  fulfilled: ['ok', 'Fulfilled'],
  cancelled: ['neutral', 'Cancelled'],
};

export const statusMeta = (status) => STATUS_META[status] ?? ['info', status];

/** Is this order finished (Past) or still moving (Active)? */
export const isPast = (o) =>
  o.status === 'cancelled' ||
  o.status === 'fulfilled' ||
  (o.kind === 'booking' ? o.status === 'paid' : false);

export const isBooking = (o) => o.kind === 'booking';

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

/** "Laundry + cleaning", "Shop order · 3 items" — what they actually bought. */
export function orderTitle(order) {
  if (!isBooking(order)) {
    const n = order.items.reduce((sum, i) => sum + i.qty, 0);
    return `Shop order · ${n} item${n === 1 ? '' : 's'}`;
  }
  if (order.service === 'combo') return 'Laundry + cleaning';
  if (order.service === 'cleaning') return 'Cleaning booking';
  return 'Laundry pickup';
}

/**
 * The headline number and what it means.
 *
 * A booking's figure changes meaning three times over its life — deposit
 * due, then estimate, then final — and showing "$119.48" without saying
 * which one it is has been the single most misread thing in the app.
 */
export function orderAmount(order) {
  if (!isBooking(order)) return [order.total, 'total'];

  const assessed = order.actualTotal !== null && order.actualTotal !== undefined;

  if (order.depositStatus !== 'paid' && order.status === 'booked') {
    return [order.depositAmount, 'deposit due'];
  }
  if (order.balanceStatus === 'awaiting') {
    return [order.balanceDue, 'balance owing'];
  }
  return assessed ? [order.actualTotal, 'final'] : [order.estimatedTotal, 'estimate'];
}
