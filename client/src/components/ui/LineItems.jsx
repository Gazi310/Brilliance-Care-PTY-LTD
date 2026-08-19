/**
 * LineItems — a name/value list for money.
 *
 * Cart, checkout, invoice and order review all show the same shape:
 * a list of charges, a total, and sometimes an amount due right now.
 * Having one component means the deposit maths is presented
 * identically everywhere, which matters — the deposit model is the
 * thing customers most often misread.
 *
 * lines: [{ label, value, note, emphasis }] where emphasis is
 *        'total' (heavy rule above, display face) or
 *        'due'   (gold panel — the amount payable now)
 */
export default function LineItems({ lines = [], className = '' }) {
  return (
    <ul className={`m-0 list-none p-0 ${className}`}>
      {lines.map((l, i) => {
        // Index in the key because an order can legitimately carry two
        // lines with the same label (two pickups, two of a product).
        const key = `${l.label}-${i}`;

        if (l.emphasis === 'total') {
          return (
            <li
              key={key}
              className="mt-2 flex justify-between gap-4 border-t-2 border-navy-900 pt-4 font-display text-[22px] font-bold text-navy-900"
            >
              <span>{l.label}</span>
              <span className="whitespace-nowrap">{l.value}</span>
            </li>
          );
        }

        if (l.emphasis === 'due') {
          return (
            <li
              key={key}
              className="-mx-5 mt-2.5 flex justify-between gap-4 rounded-btn bg-gold-100 px-5 py-4 font-bold text-navy-900"
            >
              <span>
                {l.label}
                {l.note && (
                  <small className="block text-[13px] font-medium text-muted">{l.note}</small>
                )}
              </span>
              <span className="whitespace-nowrap">{l.value}</span>
            </li>
          );
        }

        return (
          <li
            key={key}
            className="flex justify-between gap-4 border-b border-line py-3.5 text-base last:border-b-0"
          >
            <span className="text-muted">
              {l.label}
              {l.note && (
                <small className="block text-[13px] text-muted/80">{l.note}</small>
              )}
            </span>
            <span className="whitespace-nowrap font-semibold">{l.value}</span>
          </li>
        );
      })}
    </ul>
  );
}
