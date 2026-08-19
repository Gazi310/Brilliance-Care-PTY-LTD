import LineItems from '../ui/LineItems.jsx';

/**
 * The money block of an invoice — blueprint §4.11.
 *
 * Order matters more than styling here: estimate, then actual, then the
 * deposit coming *off*, then what's left. That sequence is the argument
 * the deposit model has to win, and reading it top to bottom is the
 * whole explanation.
 */
const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function InvoiceTotals({ invoice, className = '' }) {
  const credit = invoice.balanceDue < 0;

  return (
    <div className={className}>
      <LineItems
        lines={[
          { label: 'Original estimate', value: money(invoice.estimatedTotal) },
          { label: 'Assessed total (incl. GST)', value: money(invoice.total) },
          { label: 'GST included', value: money(invoice.gstAmount) },
          { label: 'Less deposit paid', value: `− ${money(invoice.depositApplied)}` },
          {
            label: credit ? 'Credit owed to you' : 'Balance due',
            value: money(Math.abs(invoice.balanceDue)),
            emphasis: 'total',
          },
        ]}
      />

      {credit && (
        <p className="bc-meta mt-3.5 text-muted">
          Your deposit covered more than the final total — we'll refund the difference to the
          card you paid with.
        </p>
      )}
    </div>
  );
}
