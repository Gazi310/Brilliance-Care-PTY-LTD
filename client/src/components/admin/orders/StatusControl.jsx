import { useState } from 'react';
import {
  statusPill,
  BOOKING_SET_STATUSES,
  SHOP_SET_STATUSES,
} from './orderStatusMeta.js';
import { adminUpdateStatus } from '../../../services/orderService.js';

/**
 * Move an order through its lifecycle. `assessed` and booking `paid` are
 * reached through the assess & payment flows, so they never appear here —
 * that keeps the status and the money records honest with each other.
 */
export default function StatusControl({ order, onChanged }) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isBooking = order.kind === 'booking';
  const options = isBooking ? BOOKING_SET_STATUSES : SHOP_SET_STATUSES;
  const [pillCls, pillLabel] = statusPill(order.status);
  const closed = order.status === 'cancelled' || order.status === 'paid';

  const apply = async (status) => {
    if (!status || status === order.status) return;
    if (status === 'cancelled' && !window.confirm('Cancel this order? This cannot be undone here.')) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const updated = await adminUpdateStatus(order._id, status);
      setValue('');
      onChanged?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Status</p>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${pillCls}`}>
            {pillLabel}
          </span>
        </div>

        {!closed && (
          <div className="flex items-center gap-2">
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={busy}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm font-bold text-muted shadow-soft focus:border-aqua focus:outline-none"
              aria-label="Move to status"
            >
              <option value="">Move to…</option>
              {options
                .filter((s) => s !== order.status)
                .map((s) => (
                  <option key={s} value={s}>
                    {statusPill(s)[1]}
                  </option>
                ))}
            </select>
            <button
              type="button"
              disabled={busy || !value}
              onClick={() => apply(value)}
              className="rounded-xl bg-navy px-3.5 py-2 text-sm font-bold text-white shadow-soft transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Update'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => apply('cancelled')}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {isBooking && !closed && (
        <p className="mt-2 text-[11px] text-faint">
          “Assessed” is set when you save actuals below; the order closes as Paid once it’s delivered
          and the balance is settled.
        </p>
      )}
      {error && (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          ⚠️ {error}
        </p>
      )}
    </section>
  );
}
