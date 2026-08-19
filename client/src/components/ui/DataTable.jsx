/**
 * DataTable — the admin table.
 *
 * Denser than PriceTable and styled for scanning rather than
 * selling: pale header, hairline rows, numbers right-aligned and
 * bold. Scrolls horizontally on mobile.
 *
 * columns: [{ key, label, align, render }]
 *          `render(row)` wins over the raw cell value, which is how
 *          you get Tags, buttons and links into cells without this
 *          component knowing anything about them.
 * onRowClick:   optional — makes rows keyboard-focusable too.
 * rowClassName: optional `(row) => string`, for tinting a class of row
 *               (the assess screen shades lines added on site, so they
 *               read as "not part of the original estimate").
 * flush:        drop the outer border and radius — for a table sitting
 *               inside a <Panel>, which already provides both.
 */
export default function DataTable({
  columns = [],
  rows = [],
  onRowClick,
  rowClassName,
  flush = false,
  empty = 'Nothing here yet.',
  className = '',
}) {
  const shell = flush ? 'overflow-x-auto' : 'overflow-x-auto rounded-card border border-line bg-white';

  if (rows.length === 0) {
    return (
      <div className={`rounded-card border border-line bg-white p-10 text-center ${className}`}>
        <p className="bc-body text-muted">{empty}</p>
      </div>
    );
  }

  return (
    <div className={`${shell} ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`whitespace-nowrap border-b border-line bg-[#FBFDFF] px-6 py-3.5 text-xs font-bold uppercase leading-[1.3] tracking-[0.05em] text-muted ${
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
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              className={`${onRowClick ? 'cursor-pointer transition-colors hover:bg-sky-50' : ''} ${
                rowClassName?.(row) ?? ''
              }`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`border-b border-line px-6 py-3.5 text-[14.5px] ${
                    c.align === 'right' ? 'whitespace-nowrap text-right font-bold' : 'text-left'
                  }`}
                >
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
