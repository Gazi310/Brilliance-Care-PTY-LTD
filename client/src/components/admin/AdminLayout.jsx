import { NavLink, Link, Outlet } from 'react-router-dom';

/* Live admin sections + future ones (shown greyed as "soon"). */
const LIVE = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/services', label: 'Laundry' },
  { to: '/admin/cleaning', label: 'Cleaning' },
  { to: '/admin/products', label: 'Shop' },
];
const SOON = ['Orders', 'Schedule', 'Customers', 'Settings'];

/**
 * Shell for the /admin/* area. Guarded once (via PrivateRoute requireAdmin in
 * the router), then renders a shared admin bar + the active section via <Outlet />.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface pb-28 lg:pb-16">
      <div className="border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-aqua text-white shadow-soft">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.3 6.4L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3L12 2z" />
                </svg>
              </span>
              <div className="leading-none">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-faint">
                  Brilliance Care
                </p>
                <p className="text-sm font-extrabold text-ink">Admin</p>
              </div>
            </div>
            <Link
              to="/"
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-soft transition hover:-translate-y-0.5"
            >
              View site →
            </Link>
          </div>

          <nav className="mt-3 flex flex-wrap items-center gap-1.5">
            {LIVE.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                    isActive
                      ? 'bg-navy text-white shadow-soft'
                      : 'text-muted hover:bg-surface hover:text-navy'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {SOON.map((s) => (
              <span
                key={s}
                title="Coming in a later phase"
                className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold text-faint/70"
              >
                {s}
                <span className="rounded-full bg-line px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-faint">
                  soon
                </span>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
