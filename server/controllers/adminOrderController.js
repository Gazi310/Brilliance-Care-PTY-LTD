import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import User from '../models/User.js';
import { notifyInvoiceSent, notifyBalancePaid } from '../utils/notifications.js';

const round2 = (n) => Math.round(n * 100) / 100;
// Prices are GST-inclusive; at 10% GST the tax component is total / 11.
const gstIncluded = (total) => round2(total / 11);
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The order auto-closes as `paid` once BOTH sides are done: the goods/home are
 * delivered AND the money is settled (balance paid, waived, or none due).
 * Called after every status / payment mutation.
 */
export function maybeFinalize(order) {
  const settled = ['paid', 'waived', 'none'].includes(order.balanceStatus);
  if (order.status === 'delivered' && order.invoiceRef && settled) {
    order.status = 'paid';
  }
}

/* ------------------------------------------------------------------ */
/*  GET /api/orders  (admin) — the orders & bookings work queue.       */
/*  ?segment=all|new|scheduled|in_progress|awaiting_invoice|           */
/*           awaiting_payment|completed                                */
/*  ?q= search orderNumber / contact name / phone   ?kind=shop|booking */
/* ------------------------------------------------------------------ */
export const listOrders = asyncHandler(async (req, res) => {
  const { segment = 'all', q = '', kind = '' } = req.query;
  const filter = {};

  if (kind === 'shop' || kind === 'booking') filter.kind = kind;

  switch (segment) {
    case 'new':
      filter.status = { $in: ['booked', 'pending'] };
      break;
    case 'scheduled':
      filter.status = { $in: ['deposit_paid', 'scheduled'] };
      break;
    case 'in_progress':
      filter.status = { $in: ['picked_up', 'in_progress'] };
      break;
    case 'awaiting_invoice': // work underway/done but no final bill yet
      filter.kind = 'booking';
      filter.status = { $in: ['picked_up', 'in_progress', 'assessed'] };
      filter.invoiceRef = null;
      break;
    case 'awaiting_payment':
      filter.balanceStatus = 'awaiting';
      break;
    case 'completed':
      filter.status = { $in: ['paid', 'fulfilled'] };
      break;
    default:
      break; // all
  }

  const query = String(q || '').trim();
  if (query) {
    const rx = new RegExp(escapeRegex(query), 'i');
    filter.$or = [{ orderNumber: rx }, { 'contact.name': rx }, { 'contact.phone': rx }];
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate('user', 'name email');
  res.json(orders);
});

/* ------------------------------------------------------------------ */
/*  PATCH /api/orders/:id/status  (admin) — advance the lifecycle.     */
/*  `paid` and `assessed` are reached through their own flows, not     */
/*  set by hand, so the money records always match the status.         */
/* ------------------------------------------------------------------ */
const BOOKING_STATUSES = [
  'booked', 'deposit_paid', 'scheduled', 'picked_up', 'in_progress',
  'ready', 'out_for_delivery', 'delivered', 'cancelled',
];
const SHOP_STATUSES = ['pending', 'paid', 'fulfilled', 'cancelled'];

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const status = String(req.body.status || '');

  if (status === 'assessed') {
    res.status(400);
    throw new Error('Record actuals through Assess & Invoice instead of setting this by hand');
  }
  if (order.kind === 'booking' && status === 'paid') {
    res.status(400);
    throw new Error('Bookings close as paid automatically once delivered and the balance is settled');
  }
  const allowed = order.kind === 'booking' ? BOOKING_STATUSES : SHOP_STATUSES;
  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error(`"${status}" is not a valid status for this order`);
  }

  order.status = status;
  maybeFinalize(order);
  await order.save();
  res.json(order);
});

/* ------------------------------------------------------------------ */
/*  POST /api/orders/:id/assess  (admin) — record the ACTUALS.         */
/*  Body: {                                                            */
/*    lines:  [{ index, actualQty, actualUnitPrice }],  // per booked line */
/*    extras: [{ label, unit, qty, unitPrice, kind, note }], // added on site */
/*    note:   'why it changed'                                         */
/*  }                                                                  */
/*  Booked lines keep estQty > 0; extras are stored with estQty 0 so   */
/*  re-assessing can rebuild them cleanly and the invoice can show     */
/*  "added" against them.                                              */
/* ------------------------------------------------------------------ */
export const assessOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.kind !== 'booking') {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (order.status === 'cancelled') {
    res.status(409);
    throw new Error('This booking was cancelled');
  }
  if (order.invoiceRef) {
    const existing = await Invoice.findById(order.invoiceRef);
    if (existing && existing.status !== 'void') {
      res.status(409);
      throw new Error('An invoice was already sent for this booking — void it before re-assessing');
    }
  }

  const { lines = [], extras = [], note = '' } = req.body;

  // Original booked lines (estQty > 0) — apply actuals, defaulting to the estimate.
  const booked = order.lineItems.filter((l) => l.estQty > 0);
  const nextLines = booked.map((l) => ({ ...l.toObject(), actualQty: l.estQty, actualUnitPrice: l.estUnitPrice, actualAmount: l.estAmount }));

  for (const patch of Array.isArray(lines) ? lines : []) {
    const i = Number(patch.index);
    if (!Number.isInteger(i) || i < 0 || i >= nextLines.length) continue;
    const line = nextLines[i];
    const qty = patch.actualQty === undefined ? line.estQty : Number(patch.actualQty);
    const price =
      patch.actualUnitPrice === undefined ? line.estUnitPrice : Number(patch.actualUnitPrice);
    if (!Number.isFinite(qty) || qty < 0 || !Number.isFinite(price) || price < 0) {
      res.status(400);
      throw new Error(`Actual quantity and price for "${line.label}" must be non-negative numbers`);
    }
    line.actualQty = qty;
    line.actualUnitPrice = round2(price);
    line.actualAmount = round2(qty * price);
  }

  // Extra services discovered on site (ironing, stain treatment, extra time…).
  for (const ex of Array.isArray(extras) ? extras : []) {
    const label = String(ex.label || '').trim();
    const qty = Number(ex.qty);
    const price = Number(ex.unitPrice);
    if (!label) {
      res.status(400);
      throw new Error('Each extra service needs a name');
    }
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) {
      res.status(400);
      throw new Error(`Quantity and price for the extra "${label}" must be positive numbers`);
    }
    nextLines.push({
      kind: ['laundry', 'cleaning', 'addon'].includes(ex.kind) ? ex.kind : 'addon',
      serviceRef: null,
      label,
      unit: String(ex.unit || '').trim(),
      estQty: 0,
      estUnitPrice: 0,
      estAmount: 0,
      actualQty: qty,
      actualUnitPrice: round2(price),
      actualAmount: round2(qty * price),
      note: String(ex.note || '').trim(),
    });
  }

  const actualTotal = round2(nextLines.reduce((s, l) => s + (l.actualAmount || 0), 0));
  const depositApplied = order.depositStatus === 'paid' ? order.depositAmount : 0;

  order.lineItems = nextLines;
  order.actualTotal = actualTotal;
  order.balanceDue = round2(actualTotal - depositApplied);
  order.assessmentNote = String(note || '').trim();
  order.status = 'assessed';
  await order.save();

  res.json(order);
});

/* ------------------------------------------------------------------ */
/*  POST /api/orders/:id/invoice  (admin) — generate & send the bill.  */
/*  Body: { channels: ['email','sms'], note }                          */
/* ------------------------------------------------------------------ */
export const createInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.kind !== 'booking') {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (order.actualTotal === null || order.status === 'cancelled') {
    res.status(409);
    throw new Error('Assess the job (record actuals) before generating the invoice');
  }
  if (order.invoiceRef) {
    const existing = await Invoice.findById(order.invoiceRef);
    if (existing && existing.status !== 'void') {
      res.status(409);
      throw new Error('An invoice was already generated for this booking');
    }
  }

  const note = String(req.body.note ?? order.assessmentNote ?? '').trim();
  const requested = Array.isArray(req.body.channels) ? req.body.channels : ['email'];
  const channels = [...new Set(requested.filter((c) => ['email', 'sms'].includes(c)))];

  const depositApplied = order.depositStatus === 'paid' ? order.depositAmount : 0;
  const balanceDue = round2(order.actualTotal - depositApplied);
  const nothingDue = balanceDue <= 0;

  const invoice = new Invoice({
    order: order._id,
    user: order.user,
    lineItems: order.lineItems.map((l) => l.toObject()),
    subtotal: order.actualTotal,
    gstAmount: gstIncluded(order.actualTotal),
    total: order.actualTotal,
    estimatedTotal: order.estimatedTotal,
    depositApplied,
    balanceDue,
    note,
    status: nothingDue ? 'paid' : 'sent',
    paymentMethod: nothingDue ? 'not_required' : '',
    paidAt: nothingDue ? new Date() : null,
  });

  // Save first so the pre-save hook assigns the invoice number…
  await invoice.save();
  // …then "send" it (mock notifier — logged + recorded for the audit trail).
  const user = order.user ? await User.findById(order.user).select('name email') : null;
  invoice.sentChannels = channels;
  invoice.notifications = await notifyInvoiceSent(order, invoice, channels, user);
  await invoice.save();

  order.invoiceRef = invoice._id;
  order.balanceDue = balanceDue;
  order.balanceStatus = nothingDue ? 'none' : 'awaiting';
  order.assessmentNote = note;
  maybeFinalize(order);
  await order.save();

  res.status(201).json({ invoice, order });
});

/* ------------------------------------------------------------------ */
/*  POST /api/orders/:id/record-balance  (admin) — settle on delivery. */
/*  Body: { method: 'cash' | 'card' | 'waive' }                        */
/* ------------------------------------------------------------------ */
export const recordBalancePayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.kind !== 'booking') {
    res.status(404);
    throw new Error('Booking not found');
  }
  const invoice = order.invoiceRef ? await Invoice.findById(order.invoiceRef) : null;
  if (!invoice || invoice.status === 'void') {
    res.status(409);
    throw new Error('Generate the invoice before recording a balance payment');
  }
  if (invoice.status === 'paid') {
    res.status(409);
    throw new Error('This invoice is already settled');
  }

  const method = String(req.body.method || '');
  if (!['cash', 'card', 'waive'].includes(method)) {
    res.status(400);
    throw new Error('Payment method must be cash, card, or waive');
  }

  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoice.paymentMethod =
    method === 'cash' ? 'cash_on_delivery' : method === 'card' ? 'card_on_delivery' : 'waived';

  order.balanceStatus = method === 'waive' ? 'waived' : 'paid';
  maybeFinalize(order);

  await invoice.save();
  await order.save();

  if (method !== 'waive') {
    const user = order.user ? await User.findById(order.user).select('name email') : null;
    await notifyBalancePaid(order, invoice, user);
  }

  res.json({ invoice, order });
});
