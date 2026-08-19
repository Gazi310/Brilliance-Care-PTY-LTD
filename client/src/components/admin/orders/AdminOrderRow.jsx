import { Link } from 'react-router-dom';
import { statusPill, money, dateLabel, needsInvoice } from './orderStatusMeta.js';
import { OrderKindIcon, ChevronRightIcon } from '../icons.jsx';
import { Button, IconBadge, Tag } from '../../ui';

/**
 * One row of the admin work queue. Bookings link through to the
 * Assess & Invoice screen; shop orders get an inline "Mark fulfilled".
 *
 * Phase 8 restyle. Structure and behaviour are unchanged — what moved is
 * the palette (surface → sky-50, navy → navy-900), the emoji kind icon
 * (🧺 🛍️ → IconBadge + SVG) and the ad-hoc amber/red pills, which are now
 * <Tag> so a status reads the same here as it does on the order screen
 * and in the customer's own order list.
 */
export default function AdminOrderRow({ order, onQuickStatus, busy }) {
  const isBooking = order.kind === 'booking';
  const [tone, label] = statusPill(order.status);

  const customer = order.contact?.name || order.user?.name || 'Guest';
  const amount = isBooking ? (order.actualTotal ?? order.estimatedTotal) : order.total;
  const balanceAwaiting = isBooking && order.balanceStatus === 'awaiting';

  const body = (
    <>
      <IconBadge
        size="inline"
        tone="sky"
        icon={<OrderKindIcon order={order} />}
        className="h-11 w-11 rounded-btn"
      />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="font-bold text-navy-900">{order.orderNumber || '—'}</span>
          <span className="truncate text-[15px] font-medium text-muted">{customer}</span>
        </span>

        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <Tag tone={tone}>{label}</Tag>
          {needsInvoice(order) && <Tag tone="warn">Invoice needed</Tag>}
          {balanceAwaiting && <Tag tone="bad">{money(order.balanceDue)} due</Tag>}
          <span className="bc-meta text-muted">{dateLabel(order.createdAt)}</span>
        </span>
      </span>

      <span className="flex flex-none flex-col items-end gap-2">
        <span className="font-display text-[17px] font-bold tabular-nums text-navy-900">
          {money(amount)}
        </span>

        {isBooking ? (
          <ChevronRightIcon width={16} height={16} className="text-muted" />
        ) : (
          order.status !== 'fulfilled' &&
          order.status !== 'cancelled' && (
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                onQuickStatus?.(order, 'fulfilled');
              }}
              className="px-3 py-1.5 text-[13px]"
            >
              Mark fulfilled
            </Button>
          )
        )}
      </span>
    </>
  );

  const rowCls =
    'flex w-full items-center gap-4 rounded-card border border-line bg-white p-4 text-left transition-colors';

  return isBooking ? (
    <Link to={`/admin/orders/${order._id}`} className={`${rowCls} hover:border-navy-500 hover:bg-sky-50`}>
      {body}
    </Link>
  ) : (
    <div className={rowCls}>{body}</div>
  );
}
