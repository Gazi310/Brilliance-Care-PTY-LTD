import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getSettings } from '../../services/settingsService';
import BrandMark from './BrandMark.jsx';
import Button from '../ui/Button.jsx';

/* ------------------------------------------------------------------ */
/*  Icons — 24x24 stroke, inherit currentColor                         */
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

const ChevronIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const MenuIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const CloseIcon = (p) => (
  <svg {...base} width={26} height={26} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const PhoneIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="M6 3h4l2 5-2.5 1.5a12 12 0 006 6L17 13l5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z" />
  </svg>
);

const AdminIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9L19 19M19 5l-2.1 2.1M7.1 16.9L5 19" />
  </svg>
);

const LogoutIcon = (p) => (
  <svg {...base} width={18} height={18} {...p}>
    <path d="M9 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Nav config — matches the wireframe's seven top-level links.        */
/*  Every one of these is a real page as of Phase 3; nothing in the    */
/*  top nav lands on a placeholder any more.                           */
/* ------------------------------------------------------------------ */
const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/laundry', label: 'Laundry' },
  { to: '/cleaning', label: 'Cleaning' },
  { to: '/products', label: 'Shop' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/contact', label: 'Contact' },
];

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */
export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  // Phone comes from /admin/settings. If it isn't set we render nothing
  // rather than the wireframe's "03 XXXX XXXX" — a visible placeholder
  // number on a live site costs more trust than an absent one.
  const [phone, setPhone] = useState('');
  useEffect(() => {
    let on = true;
    getSettings()
      .then((s) => on && setPhone(s?.businessPhone || ''))
      .catch(() => {});
    return () => {
      on = false;
    };
  }, []);

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
    `text-[15px] font-medium text-white transition-opacity ${
      isActive
        ? 'underline decoration-2 underline-offset-[5px] opacity-100'
        : 'opacity-[0.88] hover:underline hover:decoration-2 hover:underline-offset-[5px] hover:opacity-100'
    }`;

  return (
    // No overflow clipping anywhere on this element — the brand disc
    // deliberately hangs below the bar's bottom edge.
    <header className="sticky top-0 z-50 bg-navy-900">
      <div className="flex h-16 items-center gap-3 px-5 lg:h-[88px] lg:gap-8 lg:px-20">
        <BrandMark notch onClick={closeMenus} />

        {/* Desktop links */}
        <nav className="ml-auto hidden items-center gap-5 lg:flex xl:gap-[26px]">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={closeMenus} className={navLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop right-hand actions */}
        <div className="hidden flex-none items-center gap-4 lg:flex">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="hidden items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-sky-100 hover:text-white xl:flex"
            >
              <PhoneIcon />
              {phone}
            </a>
          )}

          <Button to="/book" variant="gold" size="sm" className="lg:px-6 lg:py-3.5 lg:text-[15px]">
            Book a service
          </Button>

          {/* Account */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAcctOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={acctOpen}
                className="flex items-center gap-2 rounded-btn py-1.5 pl-1.5 pr-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-500 text-xs font-bold text-navy-900">
                  {initials}
                </span>
                <ChevronIcon className={acctOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {acctOpen && (
                <>
                  <button
                    aria-hidden="true"
                    tabIndex={-1}
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setAcctOpen(false)}
                  />
                  <div
                    role="menu"
                    className="bc-pop absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-card border border-line bg-white shadow-lift"
                  >
                    <div className="border-b border-line bg-sky-50 px-4 py-3">
                      <p className="truncate text-sm font-bold text-navy-900">
                        {user.name || 'Signed in'}
                      </p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      {user.isAdmin && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-900">
                          Admin
                        </span>
                      )}
                    </div>

                    <Link
                      to="/account/orders"
                      onClick={closeMenus}
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 border-b border-line px-4 py-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-sky-50"
                    >
                      Your orders
                    </Link>

                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        onClick={closeMenus}
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 border-b border-line px-4 py-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-sky-50"
                      >
                        <AdminIcon />
                        Admin
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-sky-50 hover:text-bad"
                    >
                      <LogoutIcon />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMenus}
              className="whitespace-nowrap text-[15px] font-semibold text-white opacity-[0.88] hover:opacity-100"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Burger */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="ml-auto grid h-10 w-10 place-items-center rounded-btn text-white transition-colors hover:bg-white/10 lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile panel */}
      <div
        className={`overflow-hidden bg-navy-800 transition-[max-height,opacity] duration-300 ease-out lg:hidden ${
          mobileOpen ? 'max-h-[36rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-5 py-4">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenus}
              className={({ isActive }) =>
                `block rounded-btn px-3 py-3 text-[15px] font-semibold transition-colors ${
                  isActive ? 'bg-white/12 text-white' : 'text-sky-100 hover:bg-white/10'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <div className="mt-4 border-t border-navy-700 pt-4">
            <Button to="/book" variant="gold" block onClick={closeMenus}>
              Book a service
            </Button>

            {user ? (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3 px-1 py-2">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-sm font-bold text-navy-900">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {user.name || 'Signed in'}
                    </p>
                    <p className="truncate text-xs text-sky-100">{user.email}</p>
                  </div>
                </div>
                <Button to="/account/orders" variant="outline" block onClick={closeMenus}>
                  Your orders
                </Button>
                {user.isAdmin && (
                  <Button to="/admin" variant="outline" block onClick={closeMenus}>
                    Admin
                  </Button>
                )}
                <Button variant="ghost" block onClick={handleLogout} className="!py-3">
                  Log out
                </Button>
              </div>
            ) : (
              <Button to="/login" variant="outline" block onClick={closeMenus} className="mt-3">
                Log in
              </Button>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-sky-100"
              >
                <PhoneIcon />
                {phone}
              </a>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
