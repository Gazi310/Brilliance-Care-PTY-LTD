/**
 * Shared status/segment metadata for the admin orders area (blueprint §5.2–5.3).
 * Mirrors the server's segment definitions in adminOrderController.js.
 */

/**
 * Status → [Tag tone, label].
 *
 * Same `[tone, label]` shape as the customer side in
 * account/orderMeta.js, but the tones are chosen differently on
 * purpose. The customer's list answers "who is waiting on this?";
 * the admin's answers "does this need me to do something?":
 *
 *   warn  a job is sitting in someone's queue — chase the deposit,
 *         send the invoice, collect the balance
 *   info  moving normally, no action required
 *   ok    settled and closed
 *
 * v1 gave nine statuses nine different hues (amber/sky/indigo/violet/
 * teal/emerald). It looked precise and scanned as noise — staff can't
 * hold a nine-colour legend in their head. The wireframes use four
 * tones and let the label carry the detail, which is what this does.
 */
export const STATUS_META = {
  booked: ['warn', 'Awaiting deposit'],
  deposit_paid: ['info', 'Deposit paid'],
  scheduled: ['info', 'Scheduled'],
  picked_up: ['info', 'Picked up'],
  in_progress: ['info', 'In progress'],
  assessed: ['warn', 'Assessed — invoice due'],
  ready: ['info', 'Ready'],
  out_for_delivery: ['info', 'On the way'],
  delivered: ['ok', 'Delivered'],
  pending: ['warn', 'Pending'],
  paid: ['ok', 'Paid'],
  fulfilled: ['ok', 'Fulfilled'],
  cancelled: ['neutral', 'Cancelled'],
};

/** @returns {[string, string]} `[tone, label]` — feed straight into <Tag tone=…>. */
export const statusPill = (status) => STATUS_META[status] ?? ['info', status];

/* The work-queue lenses across the top of /admin/orders. */
export const SEGMENTS = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'awaiting_invoice', label: 'Awaiting invoice' },
  { id: 'awaiting_payment', label: 'Awaiting payment' },
  { id: 'completed', label: 'Completed' },
];

/* Statuses the admin may set by hand (server blocks `assessed` and booking
   `paid` — those come from the assess & payment flows). */
export const BOOKING_SET_STATUSES = [
  'booked', 'deposit_paid', 'scheduled', 'picked_up', 'in_progress',
  'ready', 'out_for_delivery', 'delivered',
];
export const SHOP_SET_STATUSES = ['pending', 'paid', 'fulfilled'];

/** Service → icon *name*. Resolved to an SVG by KIND_ICON in icons.jsx —
 *  this file stays plain `.js` so it can be imported anywhere without
 *  tripping Fast Refresh, which means it can't hold JSX itself. */
export const KIND_ICON_NAME = { laundry: 'basket', cleaning: 'bubbles', combo: 'basket' };

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

export const timeLabel = (iso) =>
  new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });

/** Does this booking still need its final bill? (drives the needs-action hint) */
export const needsInvoice = (o) =>
  o.kind === 'booking' &&
  !o.invoiceRef &&
  ['picked_up', 'in_progress', 'assessed'].includes(o.status);
