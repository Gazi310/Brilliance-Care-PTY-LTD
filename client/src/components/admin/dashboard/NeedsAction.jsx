import { Link } from 'react-router-dom';
import { money } from '../orders/orderStatusMeta.js';
import { Panel, Tag } from '../../ui';

/**
 * The "don't let money slip" panel (blueprint §5.1): jobs finished but not
 * invoiced, invoices awaiting payment, and products running low.
 *
 * Phase 8 restyle. v1 gave each row its own hue (violet/amber/red) as
 * decoration; here the tone tracks urgency instead — an item with a
 * count of zero is `neutral` and visibly stands down, which is what
 * makes a glance at this panel worth anything on a quiet morning.
 */
export default function NeedsAction({ needsAction }) {
  const { awaitingInvoice, awaitingPayment, awaitingPaymentTotal, lowStock, lowStockAt } =
    needsAction;

  const items = [
    {
      to: '/admin/orders?segment=awaiting_invoice',
      count: awaitingInvoice,
      title: 'Awaiting invoice',
      desc: 'Jobs done or underway with no final bill yet',
      tone: 'warn',
    },
    {
      to: '/admin/orders?segment=awaiting_payment',
      count: awaitingPayment,
      title: 'Awaiting payment',
      desc:
        awaitingPayment > 0
          ? `${money(awaitingPaymentTotal)} in sent invoices not yet paid`
          : 'Every sent invoice is settled',
      tone: 'bad',
    },
    {
      to: '/admin/products',
      count: lowStock.length,
      title: 'Low stock',
      desc:
        lowStock.length > 0
          ? lowStock.map((p) => `${p.name} (${p.stock})`).join(' · ')
          : `Nothing at ${lowStockAt} left or fewer`,
      tone: 'info',
    },
  ];

  const outstanding = items.reduce((s, i) => s + (i.count > 0 ? 1 : 0), 0);

  return (
    <Panel
      as="h2"
      title="Needs action"
      action={
        outstanding > 0 ? (
          <Tag tone="warn">{outstanding}</Tag>
        ) : (
          <Tag tone="ok">All clear</Tag>
        )
      }
      padded
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.title}
            to={it.to}
            className={`rounded-card border border-line p-5 transition-colors hover:border-navy-500 hover:bg-sky-50 ${
              it.count === 0 ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2.5">
              <p className="bc-h4">{it.title}</p>
              <Tag tone={it.count > 0 ? it.tone : 'neutral'}>{it.count}</Tag>
            </div>
            <p className="mt-2 line-clamp-2 bc-meta text-muted">{it.desc}</p>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
