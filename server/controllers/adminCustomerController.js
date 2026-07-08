import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

const round2 = (n) => Math.round(n * 100) / 100;
const digits = (s) => String(s || '').replace(/\D/g, '');
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Money actually received on an order.
 *  - shop: paid in full at checkout.
 *  - booking: deposit (if paid) + balance (if settled). A negative balance
 *    (over-collected deposit → credit) correctly reduces the sum.
 */
const received = (o) => {
  if (o.status === 'cancelled') return 0;
  if (o.kind === 'shop') return o.total || 0;
  let sum = o.depositStatus === 'paid' ? o.depositAmount || 0 : 0;
  if (o.balanceStatus === 'paid') sum += o.balanceDue || 0;
  return sum;
};

const outstandingOf = (o) =>
  o.kind === 'booking' && o.status !== 'cancelled' && o.balanceStatus === 'awaiting'
    ? Math.max(0, o.balanceDue || 0)
    : 0;

/** Roll a list of orders up into the numbers a customer row shows. */
function rollUp(orders) {
  let totalSpent = 0;
  let outstanding = 0;
  let lastOrderAt = null;
  for (const o of orders) {
    totalSpent += received(o);
    outstanding += outstandingOf(o);
    if (!lastOrderAt || o.createdAt > lastOrderAt) lastOrderAt = o.createdAt;
  }
  return {
    ordersCount: orders.length,
    totalSpent: round2(totalSpent),
    outstanding: round2(outstanding),
    lastOrderAt,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/admin/customers?q= — accounts + guests (grouped by phone) */
/* ------------------------------------------------------------------ */
export const listCustomers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const rx = q ? new RegExp(escapeRegex(q), 'i') : null;

  const [users, orders] = await Promise.all([
    User.find({}).select('name email isAdmin createdAt'),
    Order.find({ status: { $ne: 'cancelled' } }).select(
      'user kind status total depositStatus depositAmount balanceStatus balanceDue contact createdAt'
    ),
  ]);

  // Bucket orders: by owning user id, and guests (no user) by phone digits.
  const byUser = new Map();
  const byPhone = new Map();
  for (const o of orders) {
    if (o.user) {
      const key = String(o.user);
      if (!byUser.has(key)) byUser.set(key, []);
      byUser.get(key).push(o);
    } else {
      const key = digits(o.contact?.phone);
      if (key.length < 8) continue; // anonymous guest (no usable phone) — skip
      if (!byPhone.has(key)) byPhone.set(key, []);
      byPhone.get(key).push(o);
    }
  }

  const entries = [];

  for (const u of users) {
    const own = byUser.get(String(u._id)) || [];
    // Latest booking contact gives us a phone for the row (Users store none).
    const latestContact = [...own]
      .sort((a, b) => b.createdAt - a.createdAt)
      .find((o) => o.contact?.phone);
    entries.push({
      id: String(u._id),
      type: 'account',
      name: u.name,
      email: u.email,
      phone: latestContact?.contact?.phone || '',
      isAdmin: u.isAdmin,
      memberSince: u.createdAt,
      ...rollUp(own),
    });
  }

  for (const [key, own] of byPhone) {
    const latest = [...own].sort((a, b) => b.createdAt - a.createdAt)[0];
    entries.push({
      id: `guest:${key}`,
      type: 'guest',
      name: latest.contact?.name || 'Guest',
      email: '',
      phone: latest.contact?.phone || '',
      isAdmin: false,
      memberSince: null,
      ...rollUp(own),
    });
  }

  const filtered = rx
    ? entries.filter((e) => rx.test(e.name) || rx.test(e.email) || rx.test(e.phone))
    : entries;

  // Most recently active first; never-ordered accounts sink to the bottom.
  filtered.sort((a, b) => {
    const ta = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0;
    const tb = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0;
    return tb - ta;
  });

  res.json({ customers: filtered });
});

/* ------------------------------------------------------------------ */
/*  GET /api/admin/customers/:id — profile + order history.            */
/*  :id is a User ObjectId, or `guest:<phone digits>` for guests.      */
/* ------------------------------------------------------------------ */
const HISTORY_FIELDS =
  'kind service status orderNumber total estimatedTotal actualTotal depositStatus depositAmount balanceStatus balanceDue invoiceRef contact address createdAt';

export const getCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id.startsWith('guest:')) {
    const key = digits(id.slice('guest:'.length));
    if (key.length < 8) {
      res.status(400);
      throw new Error('Invalid guest customer id');
    }
    const orders = await Order.find({ user: null }).select(HISTORY_FIELDS).sort({ createdAt: -1 });
    const own = orders.filter((o) => digits(o.contact?.phone) === key);
    if (own.length === 0) {
      res.status(404);
      throw new Error('Customer not found');
    }
    const latest = own[0];
    return res.json({
      customer: {
        id,
        type: 'guest',
        name: latest.contact?.name || 'Guest',
        email: '',
        phone: latest.contact?.phone || '',
        isAdmin: false,
        memberSince: null,
        note: '',
        canNote: false, // notes live on User accounts only
        ...rollUp(own),
      },
      orders: own,
    });
  }

  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid customer id');
  }
  const user = await User.findById(id).select('name email isAdmin createdAt adminNote');
  if (!user) {
    res.status(404);
    throw new Error('Customer not found');
  }
  const own = await Order.find({ user: user._id }).select(HISTORY_FIELDS).sort({ createdAt: -1 });
  const latestContact = own.find((o) => o.contact?.phone);

  res.json({
    customer: {
      id: String(user._id),
      type: 'account',
      name: user.name,
      email: user.email,
      phone: latestContact?.contact?.phone || '',
      isAdmin: user.isAdmin,
      memberSince: user.createdAt,
      note: user.adminNote || '',
      canNote: true,
      ...rollUp(own),
    },
    orders: own,
  });
});

/* ------------------------------------------------------------------ */
/*  PUT /api/admin/customers/:id/note — save the private admin note.   */
/* ------------------------------------------------------------------ */
export const setCustomerNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id.startsWith('guest:')) {
    res.status(400);
    throw new Error('Notes can only be saved on registered accounts');
  }
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid customer id');
  }
  const note = String(req.body.note ?? '').trim();
  if (note.length > 2000) {
    res.status(400);
    throw new Error('Note must be 2000 characters or fewer');
  }
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error('Customer not found');
  }
  user.adminNote = note;
  await user.save();
  res.json({ id, note });
});
