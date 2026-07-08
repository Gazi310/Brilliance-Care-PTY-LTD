import { Link } from 'react-router-dom';
import { statusPill } from './orders/orderStatusMeta.js';

/* What each visit role means on the ground. */
const ROLE_META = {
  pickup: ['Laundry pickup', 'bg-sky-100 text-sky-800'],
  return: ['Laundry return', 'bg-teal-100 text-teal-800'],
  cleaning: ['Cleaning visit', 'bg-violet-100 text-violet-800'],
  delivery: ['Shop delivery', 'bg-amber-100 text-amber-800'],
};

/**
 * One scheduled home visit — shared by the Dashboard "Today" list and the
 * Schedule day view. Links into the order's admin detail screen.
 */
export default function JobRow({ job }) {
  const done = !job.active;
  const [pillCls, pillLabel] = statusPill(job.status);

  return (
    <Link
      to={`/admin/orders/${job.orderId}`}
      className={`flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-soft transition hover:-translate-y-0.5 ${
        done ? 'opacity-60' : ''
      }`}
    >
      {/* Window */}
      <div className="w-16 shrink-0 text-center">
        <p className="text-xs font-extrabold text-navy">{job.label}</p>
        <p className="mt-0.5 text-[10px] font-medium leading-tight text-faint">{job.time}</p>
      </div>

      <span className="h-9 w-px shrink-0 bg-line" aria-hidden="true" />

      {/* Who / what */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">
          {job.contactName}
          {job.suburb ? <span className="font-medium text-muted"> · {job.suburb}</span> : null}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {(job.roles || []).map((r) => {
            const [label, cls] = ROLE_META[r] || [r, 'bg-gray-100 text-gray-600'];
            return (
              <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>
                {label}
              </span>
            );
          })}
          <span className="text-[10px] font-bold text-faint">{job.orderNumber}</span>
        </div>
      </div>

      {/* Status */}
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${pillCls}`}>
        {pillLabel}
      </span>
    </Link>
  );
}
