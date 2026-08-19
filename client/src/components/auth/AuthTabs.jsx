import { Link } from 'react-router-dom';

/**
 * The log-in / create-account switch.
 *
 * A segmented control rather than two separate pages with a "don't have
 * an account?" link at the bottom. Both options being visible at once is
 * the point — a first-time customer arriving from a booking redirect
 * shouldn't have to read to the end of a form to find out they're on the
 * wrong one.
 *
 * Links, not ARIA tabs: these change the URL. `replace` keeps the pair
 * out of the back-button history, and `state` carries the post-login
 * redirect across the switch.
 */
const TABS = [
  { key: 'login', to: '/login', label: 'Log in' },
  { key: 'register', to: '/register', label: 'Create account' },
];

export default function AuthTabs({ mode, state }) {
  return (
    <nav
      aria-label="Log in or create an account"
      className="mb-7 flex gap-1.5 rounded-full bg-sky-50 p-[5px]"
    >
      {TABS.map((t) => {
        const on = mode === t.key;
        return (
          <Link
            key={t.key}
            to={t.to}
            replace
            state={state}
            aria-current={on ? 'page' : undefined}
            className={`flex-1 rounded-full px-3 py-3 text-center text-[15px] font-bold leading-none no-underline transition-colors ${
              on ? 'bg-navy-900 text-white' : 'text-muted hover:text-navy-900'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
