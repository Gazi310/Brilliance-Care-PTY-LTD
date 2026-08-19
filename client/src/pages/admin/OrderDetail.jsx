import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder } from '../../services/bookingService.js';
import { getInvoice } from '../../services/invoiceService.js';
import { slotLabel } from '../../components/booking/OrderTimeline.jsx';
import { statusPill, money, dateLabel } from '../../components/admin/orders/orderStatusMeta.js';
import StatusControl from '../../components/admin/orders/StatusControl.jsx';
import AssessPanel from '../../components/admin/orders/AssessPanel.jsx';
import InvoicePanel from '../../components/admin/orders/InvoicePanel.jsx';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import {
  UserIcon, PhoneIcon, HomeIcon, KeyIcon, ClipboardIcon, MoneyIcon,
  BasketIcon, BubblesIcon, TruckIcon, BoxIcon, AlertIcon,
} from '../../components/admin/icons.jsx';
import { Panel, Tag, Notice, Button, LineItems } from '../../components/ui';

/* Slot label → icon, so the logistics list reads at a glance instead of
   as four identical lines of text. */
const SLOT_ICON = {
  Pickup: BasketIcon,
  Return: TruckIcon,
  'Cleaning visit': BubblesIcon,
  Delivery: BoxIcon,
};

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
      <AdminPage>
        <div className="space-y-4">
          <div className="bc-skeleton h-9 w-56 rounded-xl" />
          <div className="bc-skeleton h-40 rounded-card" />
          <div className="bc-skeleton h-72 rounded-card" />
        </div>
      </AdminPage>
    );
  }

  if (error || !order) {
    return (
      <AdminPage>
        <Notice tone="warn" icon={<AlertIcon className="mt-0.5 flex-none" />}>
          <p>{error || 'Order not found.'}</p>
          <Button variant="ghost" to="/admin/orders" className="mt-2">
            Back to the work queue
          </Button>
        </Notice>
      </AdminPage>
    );
  }

  const isBooking = order.kind === 'booking';
  const [tone, label] = statusPill(order.status);
  const invoiceLocked = Boolean(invoice && invoice.status !== 'void');

  const slots = [
    order.laundryPickupSlot && ['Pickup', order.laundryPickupSlot],
    order.laundryReturnSlot && ['Return', order.laundryReturnSlot],
    order.cleaningSlot && ['Cleaning visit', order.cleaningSlot],
    order.deliverySlot && ['Delivery', order.deliverySlot],
  ].filter(Boolean);

  const name = order.contact?.name || order.user?.name;

  return (
    <AdminPage>
      <AdminSectionHeader
        eyebrow={`Order ${order.orderNumber} · placed ${dateLabel(order.createdAt)}`}
        title={isBooking ? 'Assess & invoice' : 'Shop order'}
        subtitle={[name, order.contact?.phone, order.address?.suburb].filter(Boolean).join(' · ')}
        action={<Tag tone={tone}>{label}</Tag>}
        crumb={{ to: '/admin/orders', label: 'Work queue', current: order.orderNumber }}
      />

      <div className="space-y-5">
        {/* ---- Customer & logistics ---- */}
        <Panel title="Customer & job" padded>
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {name && (
              <p className="flex items-center gap-2.5 bc-body">
                <UserIcon width={17} height={17} className="flex-none text-navy-500" />
                <span className="font-semibold text-navy-900">{name}</span>
              </p>
            )}

            {order.contact?.phone && (
              <p className="flex items-center gap-2.5 bc-body">
                <PhoneIcon width={17} height={17} className="flex-none text-navy-500" />
                <a href={`tel:${order.contact.phone}`} className="font-semibold text-navy-500 hover:underline">
                  {order.contact.phone}
                </a>
              </p>
            )}

            {order.address?.line1 && (
              <p className="flex items-start gap-2.5 bc-body text-muted sm:col-span-2">
                <HomeIcon width={17} height={17} className="mt-0.5 flex-none text-navy-500" />
                {order.address.line1}, {order.address.suburb} {order.address.state}{' '}
                {order.address.postcode}
              </p>
            )}

            {slots.map(([slotLabelText, slot]) => {
              const Icon = SLOT_ICON[slotLabelText] ?? BoxIcon;
              return (
                <p key={slotLabelText} className="flex items-center gap-2.5 bc-body text-muted">
                  <Icon width={17} height={17} className="flex-none text-navy-500" />
                  {slotLabelText} ·{' '}
                  <span className="font-semibold text-navy-900">{slotLabel(slot)}</span>
                </p>
              );
            })}
          </div>

          {(order.accessNotes || order.specialInstructions) && (
            <div className="mt-5 space-y-2.5 border-t border-line pt-5">
              {order.accessNotes && (
                <p className="flex items-start gap-2.5 rounded-btn bg-sky-50 px-4 py-3 bc-meta text-muted">
                  <KeyIcon width={16} height={16} className="mt-px flex-none text-navy-500" />
                  <span>
                    <b className="font-bold text-navy-900">Access:</b> {order.accessNotes}
                  </span>
                </p>
              )}
              {order.specialInstructions && (
                <p className="flex items-start gap-2.5 rounded-btn bg-sky-50 px-4 py-3 bc-meta text-muted">
                  <ClipboardIcon width={16} height={16} className="mt-px flex-none text-navy-500" />
                  <span>
                    <b className="font-bold text-navy-900">Instructions:</b>{' '}
                    {order.specialInstructions}
                  </span>
                </p>
              )}
            </div>
          )}

          {isBooking && (
            <p className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-line pt-5 bc-meta text-muted">
              <MoneyIcon width={16} height={16} className="flex-none text-navy-500" />
              Estimate <b className="font-bold text-navy-900">{money(order.estimatedTotal)}</b> ·
              deposit ({order.depositPercent}%){' '}
              <b className="font-bold text-navy-900">{money(order.depositAmount)}</b>
              <Tag tone={order.depositStatus === 'paid' ? 'ok' : 'warn'}>
                {order.depositStatus === 'paid' ? 'Deposit paid' : 'Deposit unpaid'}
              </Tag>
            </p>
          )}
        </Panel>

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
          <Panel title="Items" padded>
            <LineItems
              lines={[
                ...order.items.map((l) => ({
                  label: `${l.name} × ${l.qty}`,
                  value: money(l.price * l.qty),
                })),
                ...(order.deliveryTotal > 0
                  ? [{ label: 'Delivery', value: money(order.deliveryTotal) }]
                  : []),
                { label: 'Total', value: money(order.total), emphasis: 'total' },
              ]}
            />
          </Panel>
        )}
      </div>
    </AdminPage>
  );
}
