/**
 * The `.ahead` row from the admin wireframes: eyebrow, big display
 * title, and an actions slot pinned right. Shared so every admin page
 * stays thin and they all line up at the same baseline.
 *
 * The title is 32px display rather than the v1 20px bold. Admin pages
 * carry a lot of small text and dense tables; without one large anchor
 * at the top every screen reads as an undifferentiated wall, and staff
 * lose track of which section they're in.
 *
 * `crumb` renders the back-link above the eyebrow — used by the detail
 * screens (assess & invoice, customer detail) that sit one level down.
 */
import { Link } from 'react-router-dom';

export default function AdminSectionHeader({
  eyebrow = 'Manage',
  title,
  subtitle,
  action,
  crumb,
}) {
  return (
    <div className="mb-7">
      {crumb && (
        <p className="mb-5 text-sm text-muted">
          <Link to={crumb.to} className="font-semibold text-navy-500 hover:underline">
            {crumb.label}
          </Link>
          <span className="mx-2 text-muted">›</span>
          <span>{crumb.current}</span>
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          {eyebrow && <p className="bc-eyebrow">{eyebrow}</p>}
          <h1 className="mt-1.5 font-display text-[26px] font-bold leading-[1.15] tracking-[-0.3px] text-navy-900 lg:text-[32px]">
            {title}
          </h1>
          {subtitle && <p className="mt-2 bc-body text-muted">{subtitle}</p>}
        </div>
        {action && <div className="flex flex-wrap items-center gap-2.5">{action}</div>}
      </div>
    </div>
  );
}
