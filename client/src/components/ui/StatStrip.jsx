/**
 * StatStrip — the navy proof panel that straddles two bands.
 *
 * The negative top margin is the whole trick: it pulls the panel up
 * over the band above so it sits on the seam. Put it in a band with
 * `size="none"` and top padding removed, directly under the section
 * it's proving.
 *
 * stats: [{ value, label }] — four reads best; three works; five
 * doesn't, because the mobile layout is a 2-up grid.
 */
export default function StatStrip({ stats = [], className = '' }) {
  return (
    <div
      className={`relative z-[5] -mt-10 flex flex-wrap rounded-card bg-navy-900 px-5 py-7 shadow-lift lg:-mt-16 lg:flex-nowrap lg:px-10 lg:py-11 ${className}`}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`flex-none basis-1/2 px-2 text-center lg:flex-1 lg:basis-auto lg:px-4 ${
            i > 1 ? 'mt-6 border-t border-navy-700 pt-6 lg:mt-0 lg:border-t-0 lg:pt-0' : ''
          } ${i > 0 ? 'lg:border-l lg:border-navy-700' : ''}`}
        >
          <div className="font-display text-[34px] font-bold leading-none text-gold-500 lg:text-[44px]">
            {s.value}
          </div>
          <div className="mt-2.5 text-sm font-medium text-sky-100">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
