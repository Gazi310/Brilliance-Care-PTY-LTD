import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../../services/bookingService.js';
import { getInvoice } from '../../services/invoiceService.js';
import { slotLabel } from '../../components/booking/OrderTimeline.jsx';
import { statusPill, KIND_ICON, money, dateLabel } from '../../components/admin/orders/orderStatusMeta.js';
import StatusControl from '../../components/admin/orders/StatusControl.jsx';
import AssessPanel from '../../components/admin/orders/AssessPanel.jsx';
import InvoicePanel from '../../components/admin/orders/InvoicePanel.jsx';

/**
 * /admin/orders/:id — Assess & Invoice (blueprint §5.3), the key admin screen:
 * job details → status → record actuals → generate & send the final bill →
 * settle the balance. Composed from the section components in
 * components/admin/orders/.
 */
export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const o = await getOrder(id);
      setOrder(o);
      setInvoice(o.invoiceRef ? await getInvoice(o.invoiceRef) : null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* Child sections hand back the updated docs so everything stays in sync. */
  const onOrderChanged = (o, inv) => {
    setOrder(o);
    if (inv !== undefined) setInvoice(inv);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-6 sm:px-6 sm:py-8">
        <div className="bc-skeleton h-8 w-48 rounded-xl" />
        <div className="bc-skeleton h-40 rounded-2xl" />
        <div className="bc-skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          ⚠️ {error || 'Order not found'}
          <Link to="/admin/orders" className="ml-3 text-xs font-bold underline">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const isBooking = order.kind === 'booking';
  const [pillCls, pillLabel] = statusPill(order.status);
  const icon = isBooking ? KIND_ICON[order.service] || '🧺' : '🛍️';
  const invoiceLocked = Boolean(invoice && invoice.status !== 'void');

  const slots = [
    order.laundryPickupSlot && ['🧺 Pickup', order.laundryPickupSlot],
    order.laundryReturnSlot && ['🚚 Return', order.laundryReturnSlot],
    order.cleaningSlot && ['🫧 Cleaning visit', order.cleaningSlot],
    order.deliverySlot && ['📦 Delivery', order.deliverySlot],
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
      {/* ---- Header ---- */}
      <div>
        <Link to="/admin/orders" className="text-xs font-bold text-navy hover:underline">
          ← Orders & bookings
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {order.orderNumber}
          </h1>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${pillCls}`}>
            {pillLabel}
          </span>
          <span className="text-xs text-faint">placed {dateLabel(order.createdAt)}</span>
        </div>
      </div>

      {/* ---- Customer & logistics ---- */}
      <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Customer & job</p>
        <div className="mt-2 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {(order.contact?.name || order.user?.name) && (
            <p className="font-bold text-ink">
              👤 {order.contact?.name || order.user?.name}
              {order.contact?.phone && (
                <a href={`tel:${order.contact.phone}`} className="ml-2 font-semibold text-navy hover:underline">
                  {order.contact.phone}
                </a>
              )}
            </p>
          )}
          {order.address?.line1 && (
            <p className="text-muted">
              🏠 {order.address.line1}, {order.address.suburb} {order.address.state}{' '}
              {order.address.postcode}
            </p>
          )}
          {slots.map(([label, slot]) => (
            <p key={label} className="text-muted">
              {label} · <span className="font-semibold text-ink">{slotLabel(slot)}</span>
            </p>
          ))}
        </div>
        {(order.accessNotes || order.specialInstructions) && (
          <div className="mt-3 space-y-1.5">
            {order.accessNotes && (
              <p className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-muted">
                🔑 Access: {order.accessNotes}
              </p>
            )}
            {order.specialInstructions && (
              <p className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-muted">
                📋 Instructions: {order.specialInstructions}
              </p>
            )}
          </div>
        )}
        {isBooking && (
          <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-muted">
            💰 Estimate {money(order.estimatedTotal)} · deposit ({order.depositPercent}%){' '}
            {money(order.depositAmount)} — {order.depositStatus === 'paid' ? 'paid ✓' : 'unpaid'}
          </p>
        )}
      </section>

      {/* ---- Status ---- */}
      <StatusControl order={order} onChanged={onOrderChanged} />

      {/* ---- Booking: assess → invoice. Shop: just the item list. ---- */}
      {isBooking ? (
        <>
          <AssessPanel
            key={`${order._id}-${invoiceLocked ? 'locked' : 'open'}`}
            order={order}
            locked={invoiceLocked}
            onSaved={onOrderChanged}
          />
          <InvoicePanel order={order} invoice={invoice} onChanged={onOrderChanged} />
        </>
      ) : (
        <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Items</p>
          <div className="mt-2 space-y-1.5 text-sm">
            {order.items.map((l, i) => (
              <div key={i} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-muted">
                  {l.name} ×{l.qty}
                </span>
                <span className="font-semibold tabular-nums text-ink">{money(l.price * l.qty)}</span>
              </div>
            ))}
            {order.deliveryTotal > 0 && (
              <div className="flex justify-between text-xs text-muted">
                <span>Delivery</span>
                <span className="tabular-nums">{money(order.deliveryTotal)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-2 font-bold text-ink">
              <span>Total</span>
              <span className="tabular-nums">{money(order.total)}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
