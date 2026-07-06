/**
 * The money block of an invoice: actual total (GST-inclusive), the deposit
 * already paid, and the remaining balance — blueprint §4.11.
 */
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function InvoiceTotals({ invoice }) {
  const credit = invoice.balanceDue < 0;

  return (
    <div className="space-y-1.5 rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="flex justify-between text-sm text-muted">
        <span>Estimated total</span>
        <span className="tabular-nums">{money(invoice.estimatedTotal)}</span>
      </div>
      <div className="flex justify-between text-sm text-muted">
        <span>GST (incl. 10%)</span>
        <span className="tabular-nums">{money(invoice.gstAmount)}</span>
      </div>
      <div className="flex justify-between text-sm font-bold text-ink">
        <span>Actual total</span>
        <span className="tabular-nums">{money(invoice.total)}</span>
      </div>
      <div className="flex justify-between text-sm text-muted">
        <span>Less deposit paid</span>
        <span className="tabular-nums">−{money(invoice.depositApplied)}</span>
      </div>
      <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold text-ink">
        <span>{credit ? 'Credit owed to you' : 'Balance due'}</span>
        <span className={`tabular-nums ${credit ? 'text-emerald-600' : ''}`}>
          {money(Math.abs(invoice.balanceDue))}
        </span>
      </div>
      {credit && (
        <p className="pt-1 text-[11px] text-muted">
          Your deposit covered more than the final total — we'll refund the difference.
        </p>
      )}
    </div>
  );
}
