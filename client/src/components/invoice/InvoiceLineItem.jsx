import Tag from '../ui/Tag.jsx';

/**
 * One row of the estimate-vs-actual table.
 *
 * The sub-line under the label is the whole reason this page exists:
 * "est 2 loads → 1.6 loads" is what turns a changed number from a
 * surprise into an explanation. A row that didn't move says so
 * explicitly rather than staying silent, because silence on an invoice
 * reads as something being hidden.
 *
 * Renders a <tr>; the surrounding table lives in InvoiceLines.
 */
const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const qtyLabel = (qty, unit) => `${qty}${unit ? ` ${unit}` : ''}`;

export default function InvoiceLineItem({ line }) {
  const added = !(line.estQty > 0);
  const qtyChanged = !added && Number(line.actualQty) !== Number(line.estQty);
  const priceChanged = !added && Number(line.actualUnitPrice) !== Number(line.estUnitPrice);
  const changed = qtyChanged || priceChanged;
  const cheaper = Number(line.actualAmount) < Number(line.estAmount);

  return (
    <tr>
      <td className="border-b border-line px-5 py-4 align-top text-[15px] lg:px-[22px]">
        <strong className="font-semibold text-navy-900">{line.label}</strong>
        {added && (
          <Tag tone="warn" className="ml-2.5 align-middle">
            Added
          </Tag>
        )}

        {added ? (
          <small className="mt-[3px] block text-[13px] font-medium leading-[1.4] text-muted">
            {qtyLabel(line.actualQty, line.unit)} × {money(line.actualUnitPrice)}
            {line.note ? ` — ${line.note}` : ''}
          </small>
        ) : (
          <small className="mt-[3px] block text-[13px] font-medium leading-[1.4] text-muted">
            {changed
              ? `Estimated ${qtyLabel(line.estQty, line.unit)} · came in at ${qtyLabel(
                  line.actualQty,
                  line.unit
                )}${priceChanged ? ` · ${money(line.estUnitPrice)} → ${money(line.actualUnitPrice)}` : ''}`
              : 'Exactly as estimated'}
            {line.note ? ` — ${line.note}` : ''}
          </small>
        )}
      </td>

      <td className="whitespace-nowrap border-b border-line px-5 py-4 align-top text-[15px] text-muted lg:px-[22px]">
        {money(line.estAmount)}
      </td>

      <td
        className={`whitespace-nowrap border-b border-line px-5 py-4 text-right align-top font-display font-bold tabular-nums lg:px-[22px] ${
          cheaper ? 'text-ok' : 'text-navy-900'
        }`}
      >
        {money(line.actualAmount)}
      </td>
    </tr>
  );
}
