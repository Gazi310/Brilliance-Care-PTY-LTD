/**
 * Shared status/segment metadata for the admin orders area (blueprint §5.2–5.3).
 * Mirrors the server's segment definitions in adminOrderController.js.
 */

/* Status → pill colour + friendly label (blueprint §7: amber = awaiting,
   blue/indigo = moving, emerald = done, red = money due). */
export const STATUS_PILL = {
  booked: ['bg-amber-100 text-amber-800', 'Awaiting deposit'],
  deposit_paid: ['bg-sky-100 text-sky-800', 'Deposit paid'],
  scheduled: ['bg-sky-100 text-sky-800', 'Scheduled'],
  picked_up: ['bg-indigo-100 text-indigo-800', 'Picked up'],
  in_progress: ['bg-indigo-100 text-indigo-800', 'In progress'],
  assessed: ['bg-violet-100 text-violet-800', 'Assessed'],
  ready: ['bg-teal-100 text-teal-800', 'Ready'],
  out_for_delivery: ['bg-teal-100 text-teal-800', 'On the way'],
  delivered: ['bg-emerald-100 text-emerald-800', 'Delivered'],
  pending: ['bg-amber-100 text-amber-800', 'Pending'],
  paid: ['bg-emerald-100 text-emerald-800', 'Paid'],
  fulfilled: ['bg-emerald-100 text-emerald-800', 'Fulfilled'],
  cancelled: ['bg-gray-200 text-gray-600', 'Cancelled'],
};

export const statusPill = (status) =>
  STATUS_PILL[status] || ['bg-gray-100 text-gray-600', status];

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

export const KIND_ICON = { laundry: '🧺', cleaning: '🫧', combo: '🧺🫧' };

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

/** Does this booking still need its final bill? (drives the amber hint) */
export const needsInvoice = (o) =>
  o.kind === 'booking' &&
  !o.invoiceRef &&
  ['picked_up', 'in_progress', 'assessed'].includes(o.status);
