import { Link } from 'react-router-dom';
import { DataTable, Tag } from '../ui';
import { dateLabel, money, orderTitle, statusMeta } from './orderMeta.js';

/**
 * "Recently completed" — the finished orders, as a table.
 *
 * Active orders are cards because each one has an outstanding question
 * attached to it. Finished ones don't: they're a receipt list, and a
 * receipt list is read by scanning down a column of dates and totals.
 * The wireframe makes the same split.
 *
 * Desktop only — the caller renders the card list on mobile instead,
 * because five columns on a 390px screen is four columns too many.
 */
const COLUMNS = [
  {
    key: 'order',
    label: 'Order',
    render: (row) => (
      <>
        <strong className="font-bold text-navy-900">{row.number}</strong>
        {row.invoiceRef && (
          <Link
            to={`/account/invoices/${row.invoiceRef}`}
            className="mt-[3px] block text-[13px] font-bold text-navy-500 underline decoration-2 underline-offset-4 hover:text-navy-900"
          >
            View invoice
          </Link>
        )}
      </>
    ),
  },
  { key: 'service', label: 'Service' },
  { key: 'date', label: 'Date' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => <Tag tone={row.tone}>{row.label}</Tag>,
  },
  { key: 'total', label: 'Total', align: 'right' },
];

export default function PastOrdersTable({ orders = [], className = '' }) {
  const rows = orders.map((o) => {
    const [tone, label] = statusMeta(o.status);
    const total = o.kind === 'booking' ? (o.actualTotal ?? o.estimatedTotal) : o.total;

    return {
      id: o._id,
      number: o.orderNumber || '—',
      invoiceRef: o.invoiceRef,
      service: orderTitle(o),
      date: dateLabel(o.createdAt),
      tone,
      label,
      total: money(total),
    };
  });

  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      empty="No past orders yet — completed and cancelled orders land here."
      className={className}
    />
  );
}
