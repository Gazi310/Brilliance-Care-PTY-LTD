import CardPaymentForm from '../common/CardPaymentForm.jsx';
import { slotLabel } from '../booking/OrderTimeline.jsx';
import SummaryCard from '../ui/SummaryCard.jsx';

/**
 * The right-hand column: what's owed, and the two ways to settle it.
 *
 * Paying on delivery is given equal billing rather than buried, because
 * for a lot of customers it's the reason they trust a first booking at
 * all — and an invoice that only offers "pay now" reads as pressure.
 */
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function InvoicePayPanel({ invoice, onPay, busy }) {
  const order = invoice.order;
  const slot = order?.laundryReturnSlot || order?.cleaningSlot;

  return (
    <div className="space-y-4 lg:sticky lg:top-5">
      <SummaryCard sticky={false}>
        <p className="bc-eyebrow">Settle your balance</p>
        <p className="mt-3 font-display text-[38px] font-bold leading-none tabular-nums text-navy-900">
          {money(invoice.balanceDue)}
        </p>
        <p className="bc-meta mt-2.5 text-muted">
          {slot ? `Due on delivery — ${slotLabel(slot)}` : 'Due now, or with the driver on the day'}
        </p>
      </SummaryCard>

      <CardPaymentForm
        amount={invoice.balanceDue}
        onPay={onPay}
        busy={busy}
        buttonLabel={`Pay balance · ${money(invoice.balanceDue)}`}
      />

      <p className="bc-meta rounded-card border border-line bg-white px-5 py-4 text-muted">
        Prefer not to pay online? Settle by card or cash with the driver at delivery — just leave
        this open, nothing expires.
      </p>
    </div>
  );
}
