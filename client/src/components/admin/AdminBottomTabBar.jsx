import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

/* Icons — same 24px stroke family as the client BottomTabBar. */
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const DashIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="8" height="10" rx="1.6" />
    <rect x="13" y="3" width="8" height="6" rx="1.6" />
    <rect x="13" y="11" width="8" height="10" rx="1.6" />
    <rect x="3" y="15" width="8" height="6" rx="1.6" />
  </svg>
);
const OrdersIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 2h9l3 3v16l-3-1.8-3 1.8-3-1.8L6 21V2z" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </svg>
);
const CalendarIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);
const MoreIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

const TABS = [
  { to: '/admin', label: 'Dashboard', Icon: DashIcon, end: true },
  { to: '/admin/orders', label: 'Orders', Icon: OrdersIcon },
  { to: '/admin/schedule', label: 'Schedule', Icon: CalendarIcon },
];

/* Everything that lives behind the "More" sheet. */
const MORE_LINKS = [
  { to: '/admin/customers', label: 'Customers', emoji: '👥' },
  { to: '/admin/services', label: 'Laundry services', emoji: '🧺' },
  { to: '/admin/cleaning', label: 'Cleaning services', emoji: '🫧' },
  { to: '/admin/products', label: 'Shop & inventory', emoji: '🛍️' },
  { to: '/admin/settings', label: 'Settings', emoji: '⚙️' },
  { to: '/', label: 'View customer site', emoji: '🌐' },
];

function Tab({ to, label, Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className="flex flex-1 flex-col items-center gap-1 py-1 transition-colors"
    >
      {({ isActive }) => (
        <>
          <Icon width={23} height={23} className={isActive ? 'text-navy' : 'text-faint'} />
          <span className={`text-[10px] font-bold ${isActive ? 'text-navy' : 'text-faint'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

/**
 * Admin variant of the mobile bottom bar (blueprint §3): Dashboard · Orders ·
 * Schedule · More. "More" opens a sheet with the rest of the admin area.
 * Hidden on desktop, where the top chip nav does the job.
 */
export default function AdminBottomTabBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const moreActive = MORE_LINKS.some((l) => l.to !== '/' && pathname.startsWith(l.to));

  return (
    <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-50 lg:hidden">
      {/* More sheet + backdrop */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-0 bg-navy-d/30 backdrop-blur-[2px]"
          />
          <div className="relative z-10 mx-auto max-w-lg px-3 pb-2">
            <div className="rounded-2xl border border-line bg-white p-2 shadow-cta">
              {MORE_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    l.to !== '/' && pathname.startsWith(l.to)
                      ? 'bg-navy text-white'
                      : 'text-ink hover:bg-surface'
                  }`}
                >
                  <span aria-hidden="true">{l.emoji}</span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="relative z-10 mx-auto flex max-w-lg items-end justify-between gap-1 border-t border-line bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-8px_24px_rgba(11,58,102,0.08)] backdrop-blur-md">
        {TABS.map((t) => (
          <Tab key={t.to} {...t} />
        ))}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex flex-1 flex-col items-center gap-1 py-1 transition-colors"
        >
          <MoreIcon
            width={23}
            height={23}
            className={open || moreActive ? 'text-navy' : 'text-faint'}
          />
          <span
            className={`text-[10px] font-bold ${open || moreActive ? 'text-navy' : 'text-faint'}`}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
