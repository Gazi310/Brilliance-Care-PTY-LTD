import { Link } from 'react-router-dom';
import { statusPill } from './orders/orderStatusMeta.js';
import { Tag } from '../ui';

/**
 * What each visit role means on the ground.
 *
 * Roles are the one place on this row where colour still has to carry
 * meaning — a driver scanning the day needs pickup and delivery to be
 * distinguishable at arm's length, and they're not statuses, so they
 * can't use the Tag tones. Four fixed tints, all from the v2 palette.
 */
const ROLE_META = {
  pickup: ['Laundry pickup', 'bg-sky-100 text-navy-700'],
  return: ['Laundry return', 'bg-gold-100 text-navy-900'],
  cleaning: ['Cleaning visit', 'bg-ok-bg text-ok'],
  delivery: ['Shop delivery', 'bg-warn-bg text-warn'],
};

/**
 * One scheduled home visit — shared by the Dashboard "Today" list and the
 * Schedule day view. Links into the order's admin detail screen.
 */
export default function JobRow({ job }) {
  const done = !job.active;
  const [tone, label] = statusPill(job.status);

  return (
    <Link
      to={`/admin/orders/${job.orderId}`}
      className={`flex items-center gap-4 rounded-card border border-line bg-white p-4 transition-colors hover:border-navy-500 hover:bg-sky-50 ${
        done ? 'opacity-60' : ''
      }`}
    >
      {/* Window */}
      <div className="w-[76px] shrink-0 text-center">
        <p className="font-display text-[15px] font-bold text-navy-900">{job.label}</p>
        <p className="mt-0.5 text-[11px] font-medium leading-tight text-muted">{job.time}</p>
      </div>

      <span className="h-10 w-px shrink-0 bg-line" aria-hidden="true" />

      {/* Who / what */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-navy-900">
          {job.contactName}
          {job.suburb ? <span className="font-medium text-muted"> · {job.suburb}</span> : null}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {(job.roles || []).map((r) => {
            const [roleLabel, cls] = ROLE_META[r] || [r, 'bg-line text-muted'];
            return (
              <span
                key={r}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold leading-none tracking-[0.02em] ${cls}`}
              >
                {roleLabel}
              </span>
            );
          })}
          <span className="bc-meta text-muted">{job.orderNumber}</span>
        </div>
      </div>

      {/* Status */}
      <Tag tone={tone} className="shrink-0">
        {label}
      </Tag>
    </Link>
  );
}
