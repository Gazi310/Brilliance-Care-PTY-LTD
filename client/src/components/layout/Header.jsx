import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

/* ------------------------------------------------------------------ */
/*  Inline SVG icons - standard 24x24 stroke icons (inherit currentColor) */
/* ------------------------------------------------------------------ */
const base = {
  width: 22,
  height: 22,
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

const LaundryIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
    <path d="M4 7h16" />
    <circle cx="7" cy="4.75" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="9.5" cy="4.75" r="0.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14" r="4.2" />
    <path d="M9.2 13c1-1.2 4.6-1.2 5.6 1.6" />
  </svg>
);

const CleaningIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.2l1.7 4.6 4.6 1.7-4.6 1.7L12 15.8l-1.7-4.6L5.7 9.5l4.6-1.7L12 3.2z" />
    <path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
  </svg>
);

const BagIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 7h12l-1 13.2a1 1 0 0 1-1 .8H8a1 1 0 0 1-1-.8L6 7z" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
  </svg>
);

const CartIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M3 4h2l2.3 11.3a1 1 0 0 0 1 .8h7.7a1 1 0 0 0 1-.8L20.5 7H6" />
  </svg>
);

const LoginIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </svg>
);

const LogoutIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const ChevronIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const MenuIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const SparkleIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} {...p}>
    <path d="M12 2l2.3 6.4L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3L12 2z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Navigation config                                                  */
/* ------------------------------------------------------------------ */
const NAV = [
  { to: '/', label: 'Home', end: true, Icon: HomeIcon },
  { to: '/laundry', label: 'Laundry', Icon: LaundryIcon },
  { to: '/cleaning', label: 'Cleaning', Icon: CleaningIcon },
  { to: '/products', label: 'Shop', Icon: BagIcon },
];

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */
export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  // Collapse any open menu after a navigation.
  const closeMenus = () => {
    setMobileOpen(false);
    setAcctOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };

  const initials = (user?.name || user?.email || 'U')
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const navLinkClass = ({ isActive }) =>
    `group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/85 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Brilliance Care home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30 transition-transform duration-200 hover:scale-105">
            <SparkleIcon />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-extrabold tracking-tight text-gray-900">
              Brilliance Care
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-400">
              Laundry &amp; Cleaning
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenus}
              className={navLinkClass}
            >
              <Icon width={18} height={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cart (live count) */}
          <Link
            to="/products"
            onClick={closeMenus}
            aria-label={count ? `Cart, ${count} items` : 'Cart'}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <CartIcon />
            {count > 0 && (
              <span className="bc-pop absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          {/* Account / Login - desktop */}
          <div className="relative hidden lg:block">
            {user ? (
              <>
                <button
                  onClick={() => setAcctOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  aria-haspopup="menu"
                  aria-expanded={acctOpen}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white">
                    {initials}
                  </span>
                  <span className="max-w-[8rem] truncate">
                    {user.name || user.email}
                  </span>
                  <ChevronIcon
                    className={`transition-transform ${acctOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {acctOpen && (
                  <>
                    {/* click-away backdrop */}
                    <button
                      aria-hidden="true"
                      tabIndex={-1}
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setAcctOpen(false)}
                    />
                    <div
                      role="menu"
                      className="bc-pop absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
                    >
                      <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                        <p className="truncate text-sm font-bold text-gray-800">
                          {user.name || 'Signed in'}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                        {user.isAdmin && (
                          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Admin
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
                      >
                        <LogoutIcon width={18} height={18} />
                        Log out
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                <LoginIcon width={18} height={18} />
                Login
              </Link>
            )}
          </div>

          {/* Hamburger - mobile / tablet */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet panel */}
      <div
        className={`overflow-hidden border-t border-gray-100 bg-white transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
          mobileOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="space-y-1 px-4 py-4">
          {NAV.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenus}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon width={20} height={20} />
              {label}
            </NavLink>
          ))}

          <div className="mt-3 border-t border-gray-100 pt-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-800">
                      {user.name || 'Signed in'}
                    </p>
                    <p className="truncate text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <LogoutIcon width={18} height={18} />
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25"
              >
                <LoginIcon width={18} height={18} />
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
