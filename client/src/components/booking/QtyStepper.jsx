/**
 * Small − / value / + stepper used across the booking flow
 * (bedrooms, bathrooms, flat-priced cleans, add-on quantities).
 */
export default function QtyStepper({ value, onChange, min = 0, max = 99, suffix = '', label }) {
  const dec = () => onChange?.(Math.max(min, value - 1));
  const inc = () => onChange?.(Math.min(max, value + 1));
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-line bg-white">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label={label ? `Fewer ${label}` : 'Decrease'}
        className="flex h-9 w-9 items-center justify-center bg-surface text-lg font-bold text-ink transition hover:bg-line disabled:cursor-not-allowed disabled:text-faint/50"
      >
        −
      </button>
      <span className="min-w-[3rem] px-1 text-center text-sm font-extrabold tabular-nums text-navy">
        {value}
        {suffix}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label={label ? `More ${label}` : 'Increase'}
        className="flex h-9 w-9 items-center justify-center bg-surface text-lg font-bold text-ink transition hover:bg-line disabled:cursor-not-allowed disabled:text-faint/50"
      >
        +
      </button>
    </div>
  );
}
