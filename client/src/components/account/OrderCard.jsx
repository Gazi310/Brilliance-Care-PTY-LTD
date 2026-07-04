import { useState } from 'react';
import { Link } from 'react-router-dom';
import OrderTimeline, { buildBookingSteps, slotLabel } from '../booking/OrderTimeline.jsx';

/* Status → pill colour + friendly label. */
const STATUS_PILL = {
  // booking lifecycle
  booked: ['bg-amber-100 text-amber-800', 'Awaiting deposit'],
  deposit_paid: ['bg-sky-100 text-sky-800', 'Deposit paid'],
  scheduled: ['bg-sky-100 text-sky-800', 'Scheduled'],
  picked_up: ['bg-indigo-100 text-indigo-800', 'Picked up'],
  in_progress: ['bg-indigo-100 text-indigo-800', 'In progress'],
  assessed: ['bg-violet-100 text-violet-800', 'Assessed'],
  ready: ['bg-teal-100 text-teal-800', 'Ready'],
  out_for_delivery: ['bg-teal-100 text-teal-800', 'On the way'],
  delivered: ['bg-emerald-100 text-emerald-800', 'Delivered'],
  // shared / shop
  pending: ['bg-amber-100 text-amber-800', 'Pending'],
  paid: ['bg-emerald-100 text-emerald-800', 'Paid'],
  fulfilled: ['bg-emerald-100 text-emerald-800', 'Fulfilled'],
  cancelled: ['bg-gray-200 text-gray-600', 'Cancelled'],
};

const KIND_ICON = { laundry: '🧺', cleaning: '🫧', combo: '🧺🫧' };

const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

/** One order/booking in the account list — tap to expand details. */
export default function OrderCard({ order }) {
  const [open, setOpen] = useState(false);

  const isBooking = order.kind === 'booking';
  const [pillCls, pillLabel] = STATUS_PILL[order.status] || ['bg-gray-100 text-gray-600', order.status];
  const icon = isBooking ? KIND_ICON[order.service] || '🧺' : '🛍️';
  const title = isBooking
    ? order.service === 'combo'
      ? 'Laundry + cleaning'
      : order.service === 'cleaning'
        ? 'Cleaning booking'
        : 'Laundry pickup'
    : `Shop order · ${order.items.reduce((n, i) => n + i.qty, 0)} item${order.items.reduce((n, i) => n + i.qty, 0) === 1 ? '' : 's'}`;

  const amount = isBooking ? order.estimatedTotal : order.total;
  const needsDeposit = isBooking && order.depositStatus !== 'paid' && order.status === 'booked';
  const balanceDue = isBooking && order.balanceStatus === 'awaiting';

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-surface/50"
        aria-expanded={open}
      >
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-surface text-2xl">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-bold text-ink">{title}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${pillCls}`}>{pillLabel}</span>
            {needsDeposit && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                Action needed
              </span>
            )}
            {balanceDue && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
                Balance due
              </span>
            )}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            {order.orderNumber ? `${order.orderNumber} · ` : ''}
            {dateLabel(order.createdAt)}
            {isBooking && ' · estimated'}
          </span>
        </span>
        <span className="flex flex-none flex-col items-end gap-1">
          <span className="text-sm font-extrabold tabular-nums text-ink">
            ${Number(amount || 0).toFixed(2)}
          </span>
          <svg
            className={`h-4 w-4 text-faint transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="border-t border-line px-4 py-4">
          {/* ---- Lines ---- */}
          {isBooking ? (
            <div className="space-y-1.5 text-sm">
              {order.lineItems.map((l, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-muted">
                    {l.label}
                    {l.estQty > 1 ? ` ×${l.estQty}` : ''}
                  </span>
                  <span className="font-semibold tabular-nums text-ink">${Number(l.estAmount).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-line pt-2 font-bold text-ink">
                <span>Estimated total</span>
                <span className="tabular-nums">${Number(order.estimatedTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>Deposit ({order.depositPercent}%)</span>
                <span className="tabular-nums">
                  ${Number(order.depositAmount).toFixed(2)} · {order.depositStatus === 'paid' ? 'paid ✓' : 'unpaid'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-sm">
              {order.items.map((l, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate text-muted">{l.name} ×{l.qty}</span>
                  <span className="font-semibold tabular-nums text-ink">${(l.price * l.qty).toFixed(2)}</span>
                </div>
              ))}
              {order.deliveryTotal > 0 && (
                <div className="flex justify-between text-xs text-muted">
                  <span>Delivery</span>
                  <span className="tabular-nums">${Number(order.deliveryTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2 font-bold text-ink">
                <span>Total</span>
                <span className="tabular-nums">${Number(order.total).toFixed(2)}</span>
              </div>
              {order.deliverySlot && (
                <p className="pt-1 text-xs text-muted">🚚 Delivery · {slotLabel(order.deliverySlot)}</p>
              )}
            </div>
          )}

          {/* ---- Booking extras: address + timeline + actions ---- */}
          {isBooking && (
            <>
              {order.address && (
                <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-muted">
                  🏠 {order.address.line1}, {order.address.suburb} {order.address.state} {order.address.postcode}
                </p>
              )}
              {order.status !== 'cancelled' && (
                <div className="mt-4">
                  <OrderTimeline steps={buildBookingSteps(order)} />
                </div>
              )}
              {needsDeposit && (
                <Link
                  to={`/checkout/${order._id}`}
                  className="mt-3 block w-full rounded-xl bg-gradient-to-r from-navy to-aqua py-3 text-center text-sm font-bold text-white shadow-md transition hover:shadow-lg"
                >
                  Pay deposit · ${Number(order.depositAmount).toFixed(2)}
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
