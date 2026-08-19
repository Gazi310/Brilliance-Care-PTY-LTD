import { useState } from 'react';
import OrderTimeline, { buildBookingSteps, slotLabel } from '../booking/OrderTimeline.jsx';
import { BasketIcon, BubblesIcon, SparkleIcon, ChevronRightIcon } from '../booking/icons.jsx';
import { CartIcon, TruckIcon } from '../products/icons.jsx';
import { Button, IconBadge, LineItems, Tag } from '../ui';
import { dateLabel, isBooking, money, orderAmount, orderTitle, statusMeta } from './orderMeta.js';

const KIND_ICON = { laundry: BasketIcon, cleaning: BubblesIcon, combo: SparkleIcon };

/**
 * One order in the account list.
 *
 * Three zones, following `account-orders.html`: a header you can read at a
 * glance, a body behind a disclosure, and a footer of actions that is
 * *never* hidden. The actions staying visible is the point — "Pay deposit"
 * shouldn't require a customer to first work out that the card expands.
 */
export default function OrderCard({ order }) {
  const [open, setOpen] = useState(false);

  const booking = isBooking(order);
  const [tone, label] = statusMeta(order.status);
  const [amount, amountLabel] = orderAmount(order);
  const Icon = booking ? KIND_ICON[order.service] || BasketIcon : CartIcon;

  const assessed = booking && order.actualTotal !== null && order.actualTotal !== undefined;
  const needsDeposit = booking && order.depositStatus !== 'paid' && order.status === 'booked';
  const balanceDue = booking && order.balanceStatus === 'awaiting';
  const hasActions = booking && (needsDeposit || order.invoiceRef);

  return (
    <article className="mb-[18px] overflow-hidden rounded-card border border-line bg-white shadow-card">
      {/* ---- Header: number, state, money ---- */}
      <div className="flex flex-wrap items-center gap-4 border-b border-line px-6 py-[22px] lg:px-7">
        <IconBadge icon={Icon} size="inline" tone="sky" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="bc-h3">{order.orderNumber || orderTitle(order)}</h3>
            <Tag tone={tone}>{label}</Tag>
            {balanceDue && <Tag tone="warn">Balance due</Tag>}
          </div>
          <p className="bc-meta mt-1.5 text-muted">
            {order.orderNumber ? `${orderTitle(order)} · ` : ''}
            booked {dateLabel(order.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="font-display text-[22px] font-bold leading-[1.2] tabular-nums text-navy-900">
            {money(amount)}
          </p>
          <p className="bc-meta mt-[3px] text-muted">{amountLabel}</p>
        </div>
      </div>

      {/* ---- Body: the detail, folded away by default ---- */}
      <div className="px-6 lg:px-7">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent py-4 text-left text-sm font-bold text-navy-500 transition-colors hover:text-navy-900"
        >
          {open ? 'Hide details' : 'View details'}
          <ChevronRightIcon
            width={16}
            height={16}
            className={`transition-transform ${open ? '-rotate-90' : 'rotate-90'}`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div className="pb-6">
            {booking ? (
              <LineItems
                lines={[
                  ...order.lineItems.map((l) => ({
                    label: l.estQty > 1 ? `${l.label} ×${l.estQty}` : l.label,
                    value: money(l.estAmount),
                  })),
                  {
                    label: assessed ? 'Estimated total' : 'Estimate',
                    value: money(order.estimatedTotal),
                  },
                  ...(assessed
                    ? [{ label: 'Assessed total', value: money(order.actualTotal) }]
                    : []),
                  {
                    label: `Deposit (${order.depositPercent}%)`,
                    note: order.depositStatus === 'paid' ? 'paid' : 'not yet paid',
                    value:
                      order.depositStatus === 'paid'
                        ? `− ${money(order.depositAmount)}`
                        : money(order.depositAmount),
                  },
                ]}
              />
            ) : (
              <LineItems
                lines={[
                  ...order.items.map((l) => ({
                    label: `${l.name} ×${l.qty}`,
                    value: money(l.price * l.qty),
                  })),
                  ...(order.deliveryTotal > 0
                    ? [{ label: 'Delivery', value: money(order.deliveryTotal) }]
                    : []),
                  { label: 'Total', value: money(order.total), emphasis: 'total' },
                ]}
              />
            )}

            {!booking && order.deliverySlot && (
              <p className="bc-meta mt-4 flex items-center gap-2 text-muted">
                <TruckIcon width={16} height={16} aria-hidden="true" />
                Delivery · {slotLabel(order.deliverySlot)}
              </p>
            )}

            {booking && (
              <>
                {order.address && (
                  <p className="bc-meta mt-4 rounded-btn bg-sky-50 px-4 py-3 text-muted">
                    {order.address.line1}, {order.address.suburb} {order.address.state}{' '}
                    {order.address.postcode}
                  </p>
                )}
                {order.status !== 'cancelled' && (
                  <div className="mt-6">
                    <OrderTimeline steps={buildBookingSteps(order)} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ---- Footer: actions, always visible ---- */}
      {hasActions && (
        <div className="flex flex-wrap items-center gap-3.5 border-t border-line bg-sky-50 px-6 py-5 lg:px-7">
          {needsDeposit && (
            <Button to={`/checkout/${order._id}`} variant="gold" size="sm">
              Pay deposit · {money(order.depositAmount)}
            </Button>
          )}
          {order.invoiceRef && balanceDue && (
            <Button
              to={`/account/invoices/${order.invoiceRef}`}
              variant={needsDeposit ? 'outline' : 'gold'}
              size="sm"
            >
              View invoice &amp; pay balance
            </Button>
          )}
          {order.invoiceRef && !balanceDue && (
            <Button to={`/account/invoices/${order.invoiceRef}`} variant="outline" size="sm">
              View invoice
            </Button>
          )}
          <div className="flex-1" />
          <Button to="/contact" variant="ghost" className="text-sm">
            Need help?
          </Button>
        </div>
      )}
    </article>
  );
}
