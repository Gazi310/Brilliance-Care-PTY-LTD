import { Link } from 'react-router-dom';
import { statusPill, money, dateLabel, KIND_ICON } from '../orders/orderStatusMeta.js';

/** The amount worth showing for a history row: actual beats estimate. */
const amountOf = (o) =>
  o.actualTotal ?? (o.kind === 'booking' ? o.estimatedTotal : o.total) ?? o.total;

/** Compact order history — every row jumps into the admin order screen. */
export default function CustomerOrderHistory({ orders }) {
  return (
    <section>
      <h3 className="text-sm font-extrabold text-ink">
        Order history <span className="text-xs font-bold text-faint">· {orders.length}</span>
      </h3>

      <div className="mt-2.5 space-y-2">
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-center">
            <p className="text-2xl">🧾</p>
            <p className="mt-2 text-sm font-bold text-ink">No orders yet</p>
          </div>
        ) : (
          orders.map((o) => {
            const [pillCls, pillLabel] = statusPill(o.status);
            return (
              <Link
                key={o._id}
                to={`/admin/orders/${o._id}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-soft transition hover:-translate-y-0.5"
              >
                <span className="text-xl" aria-hidden="true">
                  {o.kind === 'shop' ? '🛍️' : KIND_ICON[o.service] || '🧺'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {o.orderNumber}
                    <span className="ml-2 text-[11px] font-medium text-faint">
                      {dateLabel(o.createdAt)}
                    </span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pillCls}`}>
                      {pillLabel}
                    </span>
                    {o.balanceStatus === 'awaiting' && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        {money(o.balanceDue)} due
                      </span>
                    )}
                  </div>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-ink">{money(amountOf(o))}</p>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
