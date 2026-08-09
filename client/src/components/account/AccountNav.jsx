import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * The side nav for the signed-in account area.
 *
 * Two destinations, not the four the wireframe sketches: there's no
 * invoice index route — invoices are reached from the order they belong
 * to, which is also how customers look for them ("the clean from last
 * Tuesday", not "invoice 0042").
 *
 * Sits above the cards on mobile as a horizontal row rather than a
 * stacked block, so the actual content isn't pushed below the fold.
 */

const LINKS = [
  { to: '/account/orders', label: 'My orders' },
  { to: '/account/profile', label: 'Profile' },
];

export default function AccountNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <nav aria-label="Account" className="lg:w-[230px] lg:flex-none">
      <div className="rounded-card border border-line bg-sky-50 p-5 lg:sticky lg:top-5">
        <p className="bc-eyebrow mb-3.5">Account</p>

        <ul className="-mx-1 flex list-none gap-2 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0">
          {LINKS.map((l) => (
            <li key={l.to} className="flex-none lg:flex-auto">
              <NavLink
                to={l.to}
                end
                className={({ isActive }) =>
                  `block whitespace-nowrap rounded-btn px-3.5 py-2.5 text-sm font-bold no-underline transition-colors ${
                    isActive
                      ? 'bg-navy-900 text-white'
                      : 'text-navy-900 hover:bg-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-line pt-4">
          <button
            type="button"
            onClick={signOut}
            className="cursor-pointer border-0 bg-transparent p-0 text-sm font-bold text-navy-500 underline decoration-2 underline-offset-4 hover:text-navy-900"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
