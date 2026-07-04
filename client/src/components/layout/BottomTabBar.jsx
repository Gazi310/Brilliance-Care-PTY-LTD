import { NavLink } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Icons — 24px stroke, inherit currentColor (match the Header set)   */
/* ------------------------------------------------------------------ */
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

const HomeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </svg>
);
const ServicesIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.6" />
    <rect x="14" y="3" width="7" height="7" rx="1.6" />
    <rect x="3" y="14" width="7" height="7" rx="1.6" />
    <rect x="14" y="14" width="7" height="7" rx="1.6" />
  </svg>
);
const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const OrdersIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 2h9l3 3v16l-3-1.8-3 1.8-3-1.8L6 21V2z" />
    <path d="M9 8h6M9 12h6M9 16h4" />
  </svg>
);
const AccountIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5" />
  </svg>
);

/* Two tabs sit either side of the raised centre Book button. */
const LEFT = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/services', label: 'Services', Icon: ServicesIcon },
];
const RIGHT = [
  { to: '/account/orders', label: 'Orders', Icon: OrdersIcon },
  { to: '/account/profile', label: 'Account', Icon: AccountIcon },
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
 * Primary mobile navigation — a fixed bottom tab bar with a raised centre
 * "Book" button (the money path). Hidden on desktop (>= lg) where the top
 * Header nav takes over.
 */
export default function BottomTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between gap-1 border-t border-line bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 shadow-[0_-8px_24px_rgba(11,58,102,0.08)] backdrop-blur-md">
        {LEFT.map((t) => (
          <Tab key={t.to} {...t} />
        ))}

        {/* Raised centre Book button */}
        <NavLink to="/book" className="flex flex-1 flex-col items-center">
          {({ isActive }) => (
            <>
              <span
                className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy to-aqua text-white shadow-cta ring-4 ring-white transition-transform ${
                  isActive ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                <PlusIcon width={26} height={26} />
              </span>
              <span className="mt-1 text-[10px] font-extrabold text-navy">Book</span>
            </>
          )}
        </NavLink>

        {RIGHT.map((t) => (
          <Tab key={t.to} {...t} />
        ))}
      </div>
    </nav>
  );
}
