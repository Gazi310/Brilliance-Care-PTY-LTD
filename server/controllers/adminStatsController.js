import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';
import DeliverySlot from '../models/DeliverySlot.js';
import { getBookingWindowDays } from './settingsController.js';
import {
  DELIVERY_WINDOWS,
  dayFromToday,
  dayMeta,
  toYMD,
  isValidYMD,
  parseYMD,
  normalizeScope,
  scopeUsesHorizon,
  horizonEndDate,
  slotStatus,
} from '../utils/delivery.js';

const round2 = (n) => Math.round(n * 100) / 100;
const LOW_STOCK_AT = 5; // "low stock" = this many left or fewer
const WINDOW_RANK = { morning: 0, afternoon: 1, evening: 2 };

/**
 * Is this order still "live" work? Careful: `paid` means CLOSED for a booking
 * (delivered + settled) but ACTIVE for a shop order (paid, awaiting delivery).
 */
const isActive = (o) =>
  o.kind === 'booking'
    ? !['paid', 'cancelled'].includes(o.status)
    : !['fulfilled', 'cancelled'].includes(o.status);

/** Flatten one order's visits on `date` into displayable job entries. */
function jobsFromOrder(order, date) {
  return (order.visits || [])
    .filter((v) => v.date === date)
    .map((v) => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      kind: order.kind,
      service: order.service,
      status: order.status,
      active: isActive(order),
      contactName: order.contact?.name || order.user?.name || 'Guest',
      suburb: order.address?.suburb || '',
      window: v.window,
      label: v.label,
      time: v.time,
      roles: v.roles || [],
    }));
}

const byWindow = (a, b) => (WINDOW_RANK[a.window] ?? 9) - (WINDOW_RANK[b.window] ?? 9);

/* ------------------------------------------------------------------ */
/*  GET /api/admin/stats — the Dashboard's morning glance.             */
/*  Today's jobs, needs-action counters, and headline KPIs.            */
/* ------------------------------------------------------------------ */
export const getAdminStats = asyncHandler(async (req, res) => {
  const today = toYMD(dayFromToday(0));
  const startToday = dayFromToday(0);
  const startTomorrow = dayFromToday(1);
  const weekAgo = dayFromToday(-6); // rolling 7 days including today

  const [
    todayOrders,
    shopTodayAgg,
    depositsTodayAgg,
    balancesTodayAgg,
    awaitingInvoice,
    awaitingPaymentAgg,
    bookingsWeek,
    lowStock,
  ] = await Promise.all([
    // Every non-cancelled order with a home visit scheduled today.
    Order.find({ 'visits.date': today, status: { $ne: 'cancelled' } }).populate('user', 'name'),

    // Shop sales placed today (paid in full at checkout).
    Order.aggregate([
      {
        $match: {
          kind: 'shop',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: startToday, $lt: startTomorrow },
        },
      },
      { $group: { _id: null, sum: { $sum: '$total' } } },
    ]),

    // Deposits collected on bookings made today (deposit is paid at booking time).
    Order.aggregate([
      {
        $match: {
          kind: 'booking',
          depositStatus: 'paid',
          createdAt: { $gte: startToday, $lt: startTomorrow },
        },
      },
      { $group: { _id: null, sum: { $sum: '$depositAmount' } } },
    ]),

    // Invoice balances actually paid today (waived / not-required don't count).
    Invoice.aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: startToday, $lt: startTomorrow },
          paymentMethod: { $in: ['card_online', 'cash_on_delivery', 'card_on_delivery'] },
          balanceDue: { $gt: 0 },
        },
      },
      { $group: { _id: null, sum: { $sum: '$balanceDue' } } },
    ]),

    // Work done/underway with no final bill yet (mirrors the orders-queue segment).
    Order.countDocuments({
      kind: 'booking',
      status: { $in: ['picked_up', 'in_progress', 'assessed'] },
      invoiceRef: null,
    }),

    // Invoices sent, money not yet in.
    Order.aggregate([
      { $match: { kind: 'booking', balanceStatus: 'awaiting' } },
      { $group: { _id: null, sum: { $sum: '$balanceDue' }, n: { $sum: 1 } } },
    ]),

    Order.countDocuments({
      kind: 'booking',
      status: { $ne: 'cancelled' },
      createdAt: { $gte: weekAgo },
    }),

    Product.find({ available: true, stock: { $lte: LOW_STOCK_AT } })
      .select('name stock')
      .sort({ stock: 1 })
      .limit(6),
  ]);

  const shopToday = shopTodayAgg[0]?.sum || 0;
  const depositsToday = depositsTodayAgg[0]?.sum || 0;
  const balancesToday = balancesTodayAgg[0]?.sum || 0;
  const awaitingPayment = awaitingPaymentAgg[0] || { sum: 0, n: 0 };

  const todayJobs = todayOrders
    .filter(isActive)
    .flatMap((o) => jobsFromOrder(o, today))
    .sort(byWindow);

  res.json({
    date: today,
    todayJobs,
    needsAction: {
      awaitingInvoice,
      awaitingPayment: awaitingPayment.n,
      awaitingPaymentTotal: round2(awaitingPayment.sum),
      lowStockAt: LOW_STOCK_AT,
      lowStock: lowStock.map((p) => ({ _id: p._id, name: p.name, stock: p.stock })),
    },
    kpis: {
      revenueToday: round2(shopToday + depositsToday + balancesToday),
      depositsToday: round2(depositsToday),
      balancesOutstanding: round2(awaitingPayment.sum),
      bookingsWeek,
    },
  });
});

/* ------------------------------------------------------------------ */
/*  GET /api/admin/schedule?start=YYYY-MM-DD&days=7                    */
/*  Day-by-day view: every home visit (pickup/return/cleaning/delivery)*/
/*  plus the three bookable windows so the admin can open/close them.  */
/* ------------------------------------------------------------------ */
export const getAdminSchedule = asyncHandler(async (req, res) => {
  const days = Math.min(14, Math.max(1, Number(req.query.days) || 7));
  const start = isValidYMD(req.query.start) ? parseYMD(req.query.start) : dayFromToday(0);
  // The booking-windows panel is per-scope (shop / laundry / cleaning); the
  // visits list below is unaffected (visits come from orders, not slots).
  const scope = normalizeScope(req.query.scope);
  // Laundry only sells a rolling fortnight (see utils/delivery.js). Admins may
  // still open days past it — those simply aren't live to customers yet, and
  // `beyondWindow` is what lets the panel say so instead of lying.
  const usesHorizon = scopeUsesHorizon(scope);
  const windowDays = usesHorizon ? await getBookingWindowDays() : days;

  const meta = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return dayMeta(d);
  });
  const dates = meta.map((m) => m.date);
  const today = toYMD(dayFromToday(0));

  const [records, orders] = await Promise.all([
    DeliverySlot.find({ scope, date: { $in: dates } }),
    Order.find({ 'visits.date': { $in: dates }, status: { $ne: 'cancelled' } }).populate(
      'user',
      'name'
    ),
  ]);
  const byKey = new Map(records.map((r) => [`${r.date}|${r.window}`, r]));

  const daysOut = meta.map((m) => {
    const slots = DELIVERY_WINDOWS.map((w) => {
      const rec = byKey.get(`${m.date}|${w.key}`);
      const open = rec ? rec.available : false; // occupied by default
      return {
        window: w.key,
        label: w.label,
        time: w.time,
        available: open,
        status: slotStatus({ date: m.date, open, scope, windowDays }),
        note: rec?.note || '',
      };
    });
    const jobs = orders.flatMap((o) => jobsFromOrder(o, m.date)).sort(byWindow);
    const availableCount = slots.filter((s) => s.available).length;
    return {
      ...m,
      isToday: m.date === today,
      slots,
      availableCount,
      status: slotStatus({ date: m.date, open: availableCount > 0, scope, windowDays }),
      // Strictly "past the end of the window" — the week view can start in the
      // past, and a day that's already gone isn't waiting to go live.
      beyondWindow: usesHorizon && m.date > horizonEndDate(windowDays),
      jobs,
      jobCount: jobs.length,
    };
  });

  res.json({
    scope,
    start: dates[0],
    today,
    windows: DELIVERY_WINDOWS,
    usesBookingWindow: usesHorizon,
    bookingWindowDays: usesHorizon ? windowDays : null,
    bookingWindowEnd: usesHorizon ? horizonEndDate(windowDays) : null,
    days: daysOut,
  });
});
