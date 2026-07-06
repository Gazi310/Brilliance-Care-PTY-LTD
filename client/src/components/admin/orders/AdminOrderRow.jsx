import { Link } from 'react-router-dom';
import { statusPill, KIND_ICON, money, dateLabel, needsInvoice } from './orderStatusMeta.js';

/**
 * One row of the admin work queue. Bookings link through to the
 * Assess & Invoice screen; shop orders get an inline "Mark fulfilled".
 */
export default function AdminOrderRow({ order, onQuickStatus, busy }) {
  const isBooking = order.kind === 'booking';
  const [pillCls, pillLabel] = statusPill(order.status);
  const icon = isBooking ? KIND_ICON[order.service] || '🧺' : '🛍️';

  const customer = order.contact?.name || order.user?.name || 'Guest';
  const amount = isBooking ? (order.actualTotal ?? order.estimatedTotal) : order.total;
  const balanceAwaiting = isBooking && order.balanceStatus === 'awaiting';

  const body = (
    <>
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-surface text-xl">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-bold text-ink">{order.orderNumber || '—'}</span>
          <span className="truncate text-sm font-semibold text-muted">{customer}</span>
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${pillCls}`}>{pillLabel}</span>
          {needsInvoice(order) && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
              Invoice needed
            </span>
          )}
          {balanceAwaiting && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700">
              {money(order.balanceDue)} due
            </span>
          )}
          <span className="text-[11px] text-faint">{dateLabel(order.createdAt)}</span>
        </span>
      </span>
      <span className="flex flex-none flex-col items-end gap-1.5">
        <span className="text-sm font-extrabold tabular-nums text-ink">{money(amount)}</span>
        {isBooking ? (
          <svg
            className="h-4 w-4 text-faint"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        ) : (
          order.status !== 'fulfilled' &&
          order.status !== 'cancelled' && (
            <button
              type="button"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                onQuickStatus?.(order, 'fulfilled');
              }}
              className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-navy shadow-soft transition hover:bg-surface disabled:opacity-50"
            >
              Mark fulfilled
            </button>
          )
        )}
      </span>
    </>
  );

  const rowCls =
    'flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left shadow-soft transition';

  return isBooking ? (
    <Link to={`/admin/orders/${order._id}`} className={`${rowCls} hover:-translate-y-0.5 hover:shadow-md`}>
      {body}
    </Link>
  ) : (
    <div className={rowCls}>{body}</div>
  );
}
