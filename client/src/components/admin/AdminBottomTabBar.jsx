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

/* v2 replaces the emoji in the More sheet with real icons — emoji
   render differently on every platform, can't be recoloured, and
   the client named them as a reason the app looked unfinished. */
const UsersIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M2 20c1.2-3.2 3.6-4.8 7-4.8s5.8 1.6 7 4.8" />
    <path d="M16 5.5a3 3 0 010 5.6M18 20c-.3-1.5-.8-2.7-1.6-3.7" />
  </svg>
);
const BasketIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
    <path d="M4 7h16" />
    <circle cx="12" cy="14" r="4.2" />
  </svg>
);
const SparkleIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.2l1.7 4.6 4.6 1.7-4.6 1.7L12 15.8l-1.7-4.6L5.7 9.5l4.6-1.7L12 3.2z" />
  </svg>
);
const BoxIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
    <path d="M3 8l9 5 9-5" />
  </svg>
);
const CogIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M7.1 16.9L5 19" />
  </svg>
);
const GlobeIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
  </svg>
);

const TABS = [
  { to: '/admin', label: 'Dashboard', Icon: DashIcon, end: true },
  { to: '/admin/orders', label: 'Orders', Icon: OrdersIcon },
  { to: '/admin/schedule', label: 'Schedule', Icon: CalendarIcon },
];

/* Everything that lives behind the "More" sheet. */
const MORE_LINKS = [
  { to: '/admin/customers', label: 'Customers', Icon: UsersIcon },
  { to: '/admin/services', label: 'Laundry services', Icon: BasketIcon },
  { to: '/admin/cleaning', label: 'Cleaning services', Icon: SparkleIcon },
  { to: '/admin/products', label: 'Shop & inventory', Icon: BoxIcon },
  { to: '/admin/settings', label: 'Settings', Icon: CogIcon },
  { to: '/', label: 'View customer site', Icon: GlobeIcon },
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
          <Icon width={23} height={23} className={isActive ? 'text-navy-900' : 'text-muted'} />
          <span className={`text-[10px] font-bold ${isActive ? 'text-navy-900' : 'text-muted'}`}>
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
            className="fixed inset-0 z-0 bg-navy-900/30 backdrop-blur-[2px]"
          />
          <div className="relative z-10 mx-auto max-w-lg px-3 pb-2">
            <div className="rounded-card border border-line bg-white p-2 shadow-lift">
              {MORE_LINKS.map((l) => {
                const active = l.to !== '/' && pathname.startsWith(l.to);
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-bold transition-colors ${
                      active ? 'bg-navy-900 text-white' : 'text-ink hover:bg-sky-50'
                    }`}
                  >
                    <l.Icon width={19} height={19} aria-hidden="true" />
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="relative z-10 mx-auto flex max-w-lg items-end justify-between gap-1 border-t border-line bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-8px_24px_rgba(4,30,96,0.08)] backdrop-blur-md">
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
            className={open || moreActive ? 'text-navy-900' : 'text-muted'}
          />
          <span
            className={`text-[10px] font-bold ${open || moreActive ? 'text-navy-900' : 'text-muted'}`}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
