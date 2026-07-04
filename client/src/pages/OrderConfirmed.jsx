import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrder } from '../services/bookingService.js';
import OrderTimeline, { buildBookingSteps } from '../components/booking/OrderTimeline.jsx';

/**
 * /order/:id/confirmed — the post-deposit success screen (blueprint §4.8):
 * big tick, order number, deposit receipt line, what-happens-next timeline.
 */
export default function OrderConfirmed() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order && order._id === id) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getOrder(id);
        if (active) setOrder(data);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <main className="min-h-screen bg-surface pb-28 lg:pb-16">
      <div className="mx-auto max-w-lg px-4 py-8 text-center sm:px-6 sm:py-12">
        {loading ? (
          <div className="space-y-3">
            <div className="bc-skeleton mx-auto h-20 w-20 rounded-full" />
            <div className="bc-skeleton mx-auto h-6 w-48 rounded" />
            <div className="bc-skeleton h-64 rounded-2xl" />
          </div>
        ) : error || !order ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-left text-sm font-medium text-red-700">
            ⚠️ {error || 'Order not found'} —{' '}
            <Link to="/account/orders" className="font-bold underline underline-offset-2">see your orders</Link>
          </div>
        ) : (
          <>
            {/* ---- Success ring ---- */}
            <div className="bc-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal shadow-cta">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 6" />
              </svg>
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-ink">You're booked!</h1>
            <p className="mt-1 text-sm text-muted">
              Order <b className="font-bold text-ink">{order.orderNumber || `#${order._id.slice(-6)}`}</b>
              {order.depositStatus === 'paid' && (
                <> · deposit ${Number(order.depositAmount).toFixed(2)} paid</>
              )}
            </p>

            {/* ---- What happens next ---- */}
            <section className="bc-fade-up mt-6 rounded-2xl border border-line bg-white p-5 text-left shadow-soft">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">What happens next</p>
              <div className="mt-4">
                <OrderTimeline steps={buildBookingSteps(order)} />
              </div>
            </section>

            <div className="mt-6 space-y-2.5">
              <Link
                to="/account/orders"
                className="block w-full rounded-xl bg-gradient-to-r from-navy to-aqua py-3.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[.99]"
              >
                Track your order
              </Link>
              <Link
                to="/"
                className="block w-full rounded-xl border border-line bg-white py-3.5 text-sm font-bold text-navy transition hover:bg-surface"
              >
                Back to home
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
