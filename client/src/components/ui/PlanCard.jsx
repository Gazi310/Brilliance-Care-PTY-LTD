/**
 * PlanCard — one column of a tiered pricing comparison.
 *
 * `featured` adds the gold border and the floating "Most booked"
 * ribbon. Exactly one card in a set should be featured; two makes
 * the recommendation meaningless.
 *
 * The price is a display-face number so it reads as the headline of
 * the card, not as body copy that happens to contain a dollar sign.
 */
export default function PlanCard({
  name,
  price,
  unit,
  featured = false,
  ribbon = 'Most booked',
  className = '',
  children,
}) {
  return (
    <div
      className={`relative flex flex-col gap-4 rounded-card bg-white p-6 shadow-card lg:p-8 ${
        featured ? 'border-2 border-gold-500' : 'border border-line'
      } ${className}`}
    >
      {featured && (
        <span className="absolute -top-[13px] left-8 rounded-full bg-gold-500 px-3.5 py-[7px] text-[11px] font-extrabold uppercase leading-none tracking-[0.1em] text-navy-900">
          {ribbon}
        </span>
      )}

      {name && <h3 className="bc-h3">{name}</h3>}

      {price != null && (
        <p className="font-display text-[40px] font-bold leading-none text-navy-900">
          {price}
          {unit && (
            <small className="ml-1 text-[15px] font-medium leading-none text-muted">{unit}</small>
          )}
        </p>
      )}

      {children}
    </div>
  );
}
