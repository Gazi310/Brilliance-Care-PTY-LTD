import { Link } from 'react-router-dom';
import { money } from '../orders/orderStatusMeta.js';

/**
 * The "don't let money slip" panel (blueprint §5.1): jobs finished but not
 * invoiced, invoices awaiting payment, and products running low.
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
      chip: 'bg-violet-100 text-violet-800',
    },
    {
      to: '/admin/orders?segment=awaiting_payment',
      count: awaitingPayment,
      title: 'Awaiting payment',
      desc:
        awaitingPayment > 0
          ? `${money(awaitingPaymentTotal)} in sent invoices not yet paid`
          : 'Every sent invoice is settled',
      chip: 'bg-amber-100 text-amber-800',
    },
    {
      to: '/admin/products',
      count: lowStock.length,
      title: 'Low stock',
      desc:
        lowStock.length > 0
          ? lowStock.map((p) => `${p.name} (${p.stock})`).join(' · ')
          : `Nothing at ${lowStockAt} left or fewer`,
      chip: 'bg-red-100 text-red-700',
    },
  ];

  const anything = items.some((i) => i.count > 0);

  return (
    <section className="mt-6">
      <h2 className="text-sm font-extrabold text-ink">
        Needs action
        {!anything && <span className="ml-2 text-xs font-bold text-emerald-600">All clear ✓</span>}
      </h2>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.title}
            to={it.to}
            className={`rounded-2xl border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 ${
              it.count === 0 ? 'opacity-70' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-ink">{it.title}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                  it.count > 0 ? it.chip : 'bg-line text-faint'
                }`}
              >
                {it.count}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted">{it.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
