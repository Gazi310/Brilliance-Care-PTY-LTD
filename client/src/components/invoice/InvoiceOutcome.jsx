import Notice from '../ui/Notice.jsx';

/**
 * The one-sentence verdict, above the table.
 *
 * This is the most important block on the page. The deposit model reads
 * as generous or as a bait-and-switch depending entirely on whether the
 * explanation arrives before the numbers, so nothing goes above this —
 * not the line items, not the totals, not the pay button.
 */
const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

const PAID_LABEL = {
  card_online: 'paid online by card',
  cash_on_delivery: 'paid in cash on delivery',
  card_on_delivery: 'paid by card on delivery',
  waived: 'waived — there was nothing to pay',
  not_required: 'no balance was due',
};

export default function InvoiceOutcome({ invoice, justPaid = false }) {
  if (invoice.status === 'paid') {
    return (
      <Notice tone="ok">
        <strong className="font-bold">
          {justPaid ? 'Payment received — thank you.' : 'This invoice is settled.'}
        </strong>{' '}
        {PAID_LABEL[invoice.paymentMethod] || 'Paid'}
        {invoice.paidAt && ` on ${dateLabel(invoice.paidAt)}`}.
        {invoice.note && ` ${invoice.note}`}
      </Notice>
    );
  }

  const delta = Number(invoice.estimatedTotal) - Number(invoice.total);
  const lighter = delta > 0.005;
  const heavier = delta < -0.005;

  return (
    <Notice tone={lighter ? 'ok' : 'info'}>
      {lighter && (
        <>
          <strong className="font-bold">Your job came in lighter than estimated.</strong> This
          invoice is {money(delta)} below the price we quoted — you only pay for what we actually
          did.
        </>
      )}
      {heavier && (
        <>
          <strong className="font-bold">
            This invoice is {money(-delta)} above your estimate.
          </strong>{' '}
          Every line that moved is marked in the table below, with what changed.
        </>
      )}
      {!lighter && !heavier && (
        <>
          <strong className="font-bold">Exactly as estimated.</strong> Nothing changed between
          the quote and the work, so there's no adjustment on this invoice.
        </>
      )}
      {invoice.note && (
        <span className="mt-2.5 block">
          <b className="font-semibold">From the team:</b> {invoice.note}
        </span>
      )}
    </Notice>
  );
}
