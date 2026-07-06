/**
 * One line of the customer invoice — shows the actual amount billed and
 * exactly how it moved from the estimate ("est 8 kg → 10.4 kg", "added"),
 * per blueprint §4.11. Trust is the product.
 */
const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const qtyLabel = (qty, unit) => `${qty}${unit ? ` ${unit}` : ''}`;

export default function InvoiceLineItem({ line }) {
  const added = !(line.estQty > 0);
  const qtyChanged = !added && Number(line.actualQty) !== Number(line.estQty);
  const priceChanged = !added && Number(line.actualUnitPrice) !== Number(line.estUnitPrice);
  const changed = qtyChanged || priceChanged;

  return (
    <div className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink">
          {line.label}
          {added && (
            <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 align-middle text-[9px] font-extrabold uppercase text-amber-800">
              added
            </span>
          )}
        </p>
        {added ? (
          <p className="text-[11px] text-muted">
            {qtyLabel(line.actualQty, line.unit)} × {money(line.actualUnitPrice)}
          </p>
        ) : changed ? (
          <p className="text-[11px] font-semibold text-amber-700">
            est {qtyLabel(line.estQty, line.unit)} → {qtyLabel(line.actualQty, line.unit)}
            {priceChanged && ` · ${money(line.estUnitPrice)} → ${money(line.actualUnitPrice)}`}
          </p>
        ) : (
          <p className="text-[11px] text-muted">as estimated</p>
        )}
        {line.note && <p className="mt-0.5 text-[11px] italic text-faint">{line.note}</p>}
      </div>
      <div className="flex-none text-right">
        <p className="text-sm font-extrabold tabular-nums text-ink">{money(line.actualAmount)}</p>
        {changed && (
          <p className="text-[11px] tabular-nums text-faint line-through">{money(line.estAmount)}</p>
        )}
      </div>
    </div>
  );
}
