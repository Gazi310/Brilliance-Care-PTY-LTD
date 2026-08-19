/**
 * Small − / value / + stepper used across the booking flow
 * (bedrooms, bathrooms, flat-priced cleans, add-on quantities).
 */
export default function QtyStepper({ value, onChange, min = 0, max = 99, suffix = '', label }) {
  const dec = () => onChange?.(Math.max(min, value - 1));
  const inc = () => onChange?.(Math.min(max, value + 1));

  const btn =
    'flex h-10 w-10 items-center justify-center bg-sky-50 text-lg font-bold text-navy-900 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:text-muted/40';

  return (
    <div className="inline-flex items-center overflow-hidden rounded-btn border border-line bg-white">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label={label ? `Fewer ${label}` : 'Decrease'}
        className={btn}
      >
        −
      </button>
      <span className="min-w-[3rem] px-1 text-center text-[15px] font-bold tabular-nums text-navy-900">
        {value}
        {suffix}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label={label ? `More ${label}` : 'Increase'}
        className={btn}
      >
        +
      </button>
    </div>
  );
}
