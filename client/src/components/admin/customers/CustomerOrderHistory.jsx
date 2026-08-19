import { Link } from 'react-router-dom';
import { statusPill, money, dateLabel } from '../orders/orderStatusMeta.js';
import { OrderKindIcon } from '../icons.jsx';
import { Panel, Tag, IconBadge } from '../../ui';

/** The amount worth showing for a history row: actual beats estimate. */
const amountOf = (o) =>
  o.actualTotal ?? (o.kind === 'booking' ? o.estimatedTotal : o.total) ?? o.total;

/** Compact order history — every row jumps into the admin order screen. */
export default function CustomerOrderHistory({ orders }) {
  return (
    <Panel
      title="Order history"
      action={<span className="bc-meta text-muted">{orders.length}</span>}
      padded
    >
      {orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-line px-6 py-10 text-center">
          <p className="bc-h4">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((o) => {
            const [tone, label] = statusPill(o.status);

            return (
              <Link
                key={o._id}
                to={`/admin/orders/${o._id}`}
                className="flex items-center gap-4 rounded-card border border-line bg-white p-4 transition-colors hover:border-navy-500 hover:bg-sky-50"
              >
                <IconBadge
                  size="inline"
                  tone="sky"
                  icon={<OrderKindIcon order={o} />}
                  className="h-10 w-10 rounded-btn"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-navy-900">
                    {o.orderNumber}
                    <span className="ml-2.5 bc-meta font-medium text-muted">
                      {dateLabel(o.createdAt)}
                    </span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Tag tone={tone}>{label}</Tag>
                    {o.balanceStatus === 'awaiting' && (
                      <Tag tone="warn">{money(o.balanceDue)} due</Tag>
                    )}
                  </div>
                </div>

                <p className="shrink-0 font-display text-[17px] font-bold tabular-nums text-navy-900">
                  {money(amountOf(o))}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
