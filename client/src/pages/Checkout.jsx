import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getOrder, payDeposit } from '../services/bookingService.js';
import DepositPaymentForm from '../components/booking/DepositPaymentForm.jsx';

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
    <main className="min-h-screen bg-surface pb-28 lg:pb-16">
      <div className="mx-auto max-w-lg px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-4 flex items-center gap-2">
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-navy"
          >
            <span className="text-base leading-none">‹</span> My orders
          </Link>
          <h1 className="mx-auto pr-16 text-base font-extrabold text-ink">Pay deposit</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="bc-skeleton h-36 rounded-2xl" />
            <div className="bc-skeleton h-64 rounded-2xl" />
          </div>
        ) : error || !order ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {error || 'Booking not found'} —{' '}
            <Link to="/book" className="font-bold underline underline-offset-2">start a new booking</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ---- Money summary ---- */}
            <section className="bc-fade-up rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">
                  {order.orderNumber ? `Order ${order.orderNumber}` : 'Your booking'}
                </p>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800">
                  Estimated
                </span>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Estimated total</span>
                  <span className="font-semibold tabular-nums">${Number(order.estimatedTotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-aqua/10 px-2 py-1.5 text-base font-extrabold text-navy">
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
            </section>

            {/* ---- Payment (swappable mock → Stripe) ---- */}
            <DepositPaymentForm amount={Number(order.depositAmount)} onPay={handlePay} busy={busy} />

            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] leading-relaxed text-emerald-800">
              <span aria-hidden="true" className="text-base">✅</span>
              <p>
                You're only paying the <b className="font-bold">deposit</b> now. We'll send an invoice for the
                balance after your service — and explain any changes.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
