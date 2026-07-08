import { Link } from 'react-router-dom';
import { money } from '../orders/orderStatusMeta.js';

const initial = (name) => (name || '?').trim().charAt(0).toUpperCase() || '?';

/** One row in the /admin/customers list. */
export default function CustomerRow({ customer: c }) {
  return (
    <Link
      to={`/admin/customers/${encodeURIComponent(c.id)}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-soft transition hover:-translate-y-0.5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-aqua text-sm font-extrabold text-white">
        {initial(c.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
          <span className="truncate">{c.name}</span>
          {c.type === 'guest' ? (
            <span className="shrink-0 rounded-full bg-line px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-faint">
              Guest
            </span>
          ) : c.isAdmin ? (
            <span className="shrink-0 rounded-full bg-navy/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy">
              Admin
            </span>
          ) : null}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted">
          {[c.email, c.phone].filter(Boolean).join(' · ') || 'No contact details yet'}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-extrabold text-ink">{money(c.totalSpent)}</p>
        <p className="mt-0.5 text-[10px] font-bold text-faint">
          {c.ordersCount} {c.ordersCount === 1 ? 'order' : 'orders'}
        </p>
        {c.outstanding > 0 && (
          <p className="mt-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
            {money(c.outstanding)} owing
          </p>
        )}
      </div>
    </Link>
  );
}
