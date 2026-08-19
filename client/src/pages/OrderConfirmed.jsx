import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getOrder } from '../services/bookingService.js';
import OrderTimeline, { buildBookingSteps } from '../components/booking/OrderTimeline.jsx';
import { AlertIcon } from '../components/booking/icons.jsx';
import { Button, Card } from '../components/ui';

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
    <main className="min-h-screen bg-sky-50 pb-28 lg:pb-16">
      <div className="mx-auto max-w-lg px-4 py-8 text-center sm:px-6 sm:py-12">
        {loading ? (
          <div className="space-y-3">
            <div className="bc-skeleton mx-auto h-20 w-20 rounded-full" />
            <div className="bc-skeleton mx-auto h-6 w-48 rounded" />
            <div className="bc-skeleton h-64 rounded-card" />
          </div>
        ) : error || !order ? (
          <div className="flex gap-3.5 rounded-card bg-bad-bg px-5 py-[18px] text-left text-[15.5px] leading-[1.55] text-bad">
            <AlertIcon className="mt-0.5 flex-none" aria-hidden="true" />
            <p>
              {error || 'Order not found'} —{' '}
              <Link to="/account/orders" className="font-bold underline decoration-2 underline-offset-4">see your orders</Link>
            </p>
          </div>
        ) : (
          <>
            {/* ---- Success ring ---- */}
            <div className="bc-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-ok-bg text-ok shadow-card">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12l5 5L20 6" />
              </svg>
            </div>

            <h1 className="bc-h2 mt-6">You're booked!</h1>
            <p className="mt-2 text-[15px] text-muted">
              Order <b className="font-bold text-navy-900">{order.orderNumber || `#${order._id.slice(-6)}`}</b>
              {order.depositStatus === 'paid' && (
                <> · deposit ${Number(order.depositAmount).toFixed(2)} paid</>
              )}
            </p>

            {/* ---- What happens next ---- */}
            <Card as="section" className="bc-fade-up mt-8 text-left">
              <p className="bc-eyebrow">What happens next</p>
              <div className="mt-5">
                <OrderTimeline steps={buildBookingSteps(order)} />
              </div>
            </Card>

            <div className="mt-8 space-y-3">
              <Button variant="gold" to="/account/orders" block>
                Track your order
              </Button>
              <Button variant="outline" to="/" block>
                Back to home
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
