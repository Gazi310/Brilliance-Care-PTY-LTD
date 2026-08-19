import { Link } from 'react-router-dom';
import { money } from '../orders/orderStatusMeta.js';
import { Tag } from '../../ui';

const initial = (name) => (name || '?').trim().charAt(0).toUpperCase() || '?';

/**
 * One row in the /admin/customers list.
 *
 * Phase 8 restyle. The avatar loses its navy→aqua gradient (v2 has no
 * gradients at all) for a flat navy disc, and the three ad-hoc pills
 * become <Tag>s so "owing" reads identically here, in the work queue
 * and on the order screen.
 */
export default function CustomerRow({ customer: c }) {
  return (
    <Link
      to={`/admin/customers/${encodeURIComponent(c.id)}`}
      className="flex items-center gap-4 rounded-card border border-line bg-white p-4 transition-colors hover:border-navy-500 hover:bg-sky-50"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-900 font-display text-base font-bold text-white">
        {initial(c.name)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate font-bold text-navy-900">
          <span className="truncate">{c.name}</span>
          {c.type === 'guest' ? (
            <Tag tone="neutral" className="shrink-0">
              Guest
            </Tag>
          ) : c.isAdmin ? (
            <Tag tone="info" className="shrink-0">
              Admin
            </Tag>
          ) : null}
        </p>
        <p className="mt-1 truncate bc-meta text-muted">
          {[c.email, c.phone].filter(Boolean).join(' · ') || 'No contact details yet'}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-display text-[17px] font-bold tabular-nums text-navy-900">
          {money(c.totalSpent)}
        </p>
        <p className="mt-0.5 bc-meta text-muted">
          {c.ordersCount} {c.ordersCount === 1 ? 'order' : 'orders'}
        </p>
        {c.outstanding > 0 && (
          <Tag tone="warn" className="mt-1.5">
            {money(c.outstanding)} owing
          </Tag>
        )}
      </div>
    </Link>
  );
}
