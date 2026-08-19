import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getOrder, payDeposit } from '../services/bookingService.js';
import DepositPaymentForm from '../components/booking/DepositPaymentForm.jsx';
import { AlertIcon, ChevronLeftIcon } from '../components/booking/icons.jsx';
import { Card, Notice, Tag } from '../components/ui';

/**
 * /checkout/:orderId — pay the booking deposit (blueprint §4.7).
 * The estimate is already locked into the order; this screen only
 * collects the deposit and reassures about the balance-later model.
 */
export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (order && order._id === orderId) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getOrder(orderId);
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
  }, [orderId]);

  // Already paid? Straight to the confirmation.
  useEffect(() => {
    if (order && order.depositStatus === 'paid') {
      navigate(`/order/${order._id}/confirmed`, { replace: true, state: { order } });
    }
  }, [order, navigate]);

  const handlePay = async (card) => {
    setBusy(true);
    try {
      const updated = await payDeposit(orderId, card);
      navigate(`/order/${updated._id}/confirmed`, { state: { order: updated } });
    } catch (err) {
      setBusy(false);
      throw err; // surfaced inline by the form
    }
  };

  return (
    <main className="min-h-screen bg-sky-50 pb-28 lg:pb-16">
      <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-5 flex items-center gap-2">
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-navy-900"
          >
            <ChevronLeftIcon width={16} height={16} aria-hidden="true" /> My orders
          </Link>
          <h1 className="bc-h4 mx-auto pr-16">Pay deposit</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="bc-skeleton h-36 rounded-card" />
            <div className="bc-skeleton h-64 rounded-card" />
          </div>
        ) : error || !order ? (
          <div className="flex gap-3.5 rounded-card bg-bad-bg px-5 py-[18px] text-[15.5px] leading-[1.55] text-bad">
            <AlertIcon className="mt-0.5 flex-none" aria-hidden="true" />
            <p>
              {error || 'Booking not found'} —{' '}
              <Link to="/book" className="font-bold underline decoration-2 underline-offset-4">start a new booking</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ---- Money summary ---- */}
            <Card as="section" className="bc-fade-up">
              <div className="flex items-center justify-between gap-3">
                <p className="bc-eyebrow">
                  {order.orderNumber ? `Order ${order.orderNumber}` : 'Your booking'}
                </p>
                <Tag tone="gold">Estimated</Tag>
              </div>
              <div className="mt-4 space-y-2 text-[15px]">
                <div className="flex justify-between text-muted">
                  <span>Estimated total</span>
                  <span className="font-semibold tabular-nums">${Number(order.estimatedTotal).toFixed(2)}</span>
                </div>
                <div className="-mx-2 flex justify-between rounded-btn bg-gold-100 px-4 py-3 text-base font-bold text-navy-900">
                  <span>Deposit due now ({order.depositPercent}%)</span>
                  <span className="tabular-nums">${Number(order.depositAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Balance after service</span>
                  <span className="font-semibold tabular-nums">
                    ~${(Number(order.estimatedTotal) - Number(order.depositAmount)).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            {/* ---- Payment (swappable mock → real gateway) ---- */}
            <DepositPaymentForm amount={Number(order.depositAmount)} onPay={handlePay} busy={busy} />

            <Notice tone="ok">
              You're only paying the <b className="font-bold">deposit</b> now. We'll send an invoice for the
              balance after your service — and explain any changes.
            </Notice>
          </div>
        )}
      </div>
    </main>
  );
}
