import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/bookingService.js';
import OrderCard from '../components/account/OrderCard.jsx';

/** Is this order finished (Past) or still moving (Active)? */
const isPast = (o) =>
  o.status === 'cancelled' ||
  o.status === 'fulfilled' ||
  (o.kind === 'booking' ? o.status === 'paid' : false);

/**
 * /account/orders — orders & bookings with Active / Past tabs
 * (blueprint §4.9). Deposit-unpaid bookings surface a pay action.
 */
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('active');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await getMyOrders());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shown = useMemo(
    () => orders.filter((o) => (tab === 'past' ? isPast(o) : !isPast(o))),
    [orders, tab]
  );
  const activeCount = useMemo(() => orders.filter((o) => !isPast(o)).length, [orders]);

  return (
    <main className="min-h-screen bg-surface pb-28 lg:pb-16">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="text-xl font-extrabold text-ink sm:text-2xl">My orders</h1>
        <p className="mt-1 text-sm text-muted">Laundry pickups, cleans and shop orders — all in one place.</p>

        {/* ---- Tabs ---- */}
        <div className="mt-4 inline-flex rounded-xl border border-line bg-white p-1 shadow-soft">
          {['active', 'past'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold capitalize transition ${
                tab === t ? 'bg-gradient-to-r from-navy to-aqua text-white shadow' : 'text-muted hover:text-ink'
              }`}
            >
              {t}
              {t === 'active' && activeCount > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 text-[10px] ${tab === t ? 'bg-white/20' : 'bg-surface'}`}>
                  {activeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ---- List ---- */}
        <div className="mt-4 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="bc-skeleton h-20 rounded-2xl" />)
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              ⚠️ {error}
              <button
                onClick={load}
                className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white py-16 text-center shadow-soft">
              <span className="bc-float text-5xl">{tab === 'active' ? '🧺' : '📦'}</span>
              <p className="mt-4 text-base font-semibold text-muted">
                {tab === 'active' ? 'Nothing on the go yet' : 'No past orders yet'}
              </p>
              <p className="mt-1 max-w-xs text-sm text-faint">
                {tab === 'active'
                  ? 'Book a laundry pickup or a clean and track it here.'
                  : 'Completed and cancelled orders will appear here.'}
              </p>
              {tab === 'active' && (
                <Link
                  to="/book"
                  className="mt-5 rounded-xl bg-gradient-to-r from-navy to-aqua px-6 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
                >
                  Book a service
                </Link>
              )}
            </div>
          ) : (
            shown.map((o) => <OrderCard key={o._id} order={o} />)
          )}
        </div>
      </div>
    </main>
  );
}
