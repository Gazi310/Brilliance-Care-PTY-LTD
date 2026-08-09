/**
 * PriceTable — the public price list.
 *
 * Navy header row, hairline body rows, prices right-aligned in the
 * display face so the column scans as a column. Scrolls horizontally
 * on mobile rather than squashing — a price that wraps mid-figure is
 * worse than a swipe.
 *
 * columns: [{ key, label, align }]
 * rows:    [{ id, ...cellsByKey }] — a cell can be a string or
 *          { value, note } to get the smaller grey second line.
 */
export default function PriceTable({ columns = [], rows = [], caption, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-card shadow-card ${className}`}>
      <table className="w-full border-collapse bg-white">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`whitespace-nowrap border-b border-line bg-navy-900 px-[22px] py-[18px] text-[13px] font-bold uppercase leading-[1.3] tracking-[0.06em] text-white ${
                  c.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="last:[&>td]:border-b-0">
              {columns.map((c) => {
                const cell = row[c.key];
                const isObj = cell && typeof cell === 'object';
                const right = c.align === 'right';

                return (
                  <td
                    key={c.key}
                    className={`border-b border-line px-[22px] py-[18px] text-base ${
                      right
                        ? 'whitespace-nowrap text-right font-display font-bold text-navy-900'
                        : 'text-left'
                    }`}
                  >
                    {isObj ? cell.value : cell}
                    {isObj && cell.note && (
                      <small className="mt-[3px] block text-[13px] font-medium leading-[1.4] text-muted">
                        {cell.note}
                      </small>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
