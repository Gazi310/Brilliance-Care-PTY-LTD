import { NavLink, Link, Outlet } from 'react-router-dom';
import AdminBottomTabBar from './AdminBottomTabBar.jsx';
import BrandMark from '../layout/BrandMark.jsx';

/* Every admin section is live as of Phase 3. */
const LIVE = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/schedule', label: 'Schedule' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/services', label: 'Laundry' },
  { to: '/admin/cleaning', label: 'Cleaning' },
  { to: '/admin/products', label: 'Shop' },
  { to: '/admin/settings', label: 'Settings' },
];

/**
 * Shell for the /admin/* area. Guarded once (via PrivateRoute requireAdmin in
 * the router), then renders a shared admin bar + the active section via <Outlet />.
 *
 * The bar is navy rather than white so staff can tell at a glance
 * whether they're looking at the admin app or the customer site —
 * they're often in both at once, and the v1 white-on-white version
 * made those two states hard to tell apart.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F6F9FC] pb-28 lg:pb-16">
      <div className="bg-navy-900">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BrandMark size="sm" wordmark={false} />
              <div className="leading-none">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-gold-500">
                  Brilliance Care
                </p>
                <p className="mt-1 text-sm font-extrabold text-white">Admin</p>
              </div>
            </div>

            <Link
              to="/"
              className="rounded-btn px-3 py-1.5 text-xs font-bold text-sky-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] transition-colors hover:bg-white/10 hover:text-white"
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
                  `rounded-[10px] px-3 py-1.5 text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-white/[0.14] text-white'
                      : 'text-sky-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <Outlet />

      {/* Mobile-first admin nav: Dashboard · Orders · Schedule · More */}
      <AdminBottomTabBar />
    </div>
  );
}
