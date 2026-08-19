import { useEffect, useMemo, useState } from 'react';
import { getMyOrders } from '../services/bookingService.js';
import PageHero from '../components/ui/PageHero.jsx';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import Chip from '../components/ui/Chip.jsx';
import CtaBand from '../components/marketing/CtaBand.jsx';
import AccountNav from '../components/account/AccountNav.jsx';
import OrderCard from '../components/account/OrderCard.jsx';
import PastOrdersTable from '../components/account/PastOrdersTable.jsx';
import OrdersEmpty from '../components/account/OrdersEmpty.jsx';
import { AlertIcon } from '../components/booking/icons.jsx';
import { isBooking, isPast } from '../components/account/orderMeta.js';

/**
 * /account/orders — everything they've booked (blueprint §4.9).
 *
 * Three tabs rather than two. Shop orders get their own because they
 * don't share the booking lifecycle at all — no deposit, no assessment,
 * no balance — and mixing them into "Active" meant a $9 detergent order
 * sat in the same list as a $240 clean awaiting payment.
 *
 * Active orders render as cards (each has an open question attached);
 * past ones as a table on desktop, since they're a receipt list.
 */
const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'past', label: 'Past' },
  { key: 'shop', label: 'Shop orders' },
];

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

  const groups = useMemo(() => {
    const bookings = orders.filter(isBooking);
    return {
      active: bookings.filter((o) => !isPast(o)),
      past: bookings.filter(isPast),
      shop: orders.filter((o) => !isBooking(o)),
    };
  }, [orders]);

  const shown = groups[tab] ?? [];

  return (
    <main>
      <PageHero
        title="My orders"
        sub="Everything you've booked, with what's owing and what happens next."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Account' }, { label: 'Orders' }]}
      />

      <Band tone="white">
        <Container className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <AccountNav />

          <div className="min-w-0 flex-1">
            <div className="mb-[22px] flex flex-wrap gap-2">
              {TABS.map((t) => (
                <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
                  {t.label}
                  {!loading && ` (${groups[t.key].length})`}
                </Chip>
              ))}
            </div>

            {loading ? (
              <div className="space-y-[18px]">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bc-skeleton h-[132px] rounded-card" />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-wrap items-center gap-3.5 rounded-card bg-bad-bg px-5 py-[18px] text-[15.5px] leading-[1.55] text-bad">
                <AlertIcon className="flex-none" aria-hidden="true" />
                <span className="min-w-0 flex-1">{error}</span>
                <button
                  type="button"
                  onClick={load}
                  className="cursor-pointer border-0 bg-transparent p-0 text-sm font-bold text-bad underline decoration-2 underline-offset-4"
                >
                  Try again
                </button>
              </div>
            ) : shown.length === 0 ? (
              <OrdersEmpty tab={tab} />
            ) : tab === 'past' ? (
              <>
                <PastOrdersTable orders={shown} className="hidden lg:block" />
                <div className="lg:hidden">
                  {shown.map((o) => (
                    <OrderCard key={o._id} order={o} />
                  ))}
                </div>
              </>
            ) : (
              shown.map((o) => <OrderCard key={o._id} order={o} />)
            )}
          </div>
        </Container>
      </Band>

      <CtaBand
        title="Book your next one"
        sub="Your address and preferences are already saved — it's two taps."
      />
    </main>
  );
}
