/**
 * QtyControl — the kit's `.qty` stepper: − | value | +
 *
 * The booking flow has its own `booking/QtyStepper` and keeps it. That
 * one is a compact 36px control used a dozen times down a form; this is
 * the 48px shop version that sits beside an "Add to cart" button and has
 * to match its height. Same idea, different job — merging them would
 * mean a size prop that only ever takes two values.
 */
export default function QtyControl({
  value,
  onChange,
  min = 1,
  max = 99,
  label = 'quantity',
  size = 'default',
}) {
  const small = size === 'sm';
  const btn = small
    ? 'h-10 w-10 text-base'
    : 'h-12 w-11 text-lg';
  const val = small
    ? 'w-11 text-[15px] leading-10'
    : 'w-[52px] text-base leading-[48px]';

  return (
    <div className="inline-flex items-center overflow-hidden rounded-btn border border-line bg-white">
      <button
        type="button"
        onClick={() => onChange?.(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className={`${btn} bg-white font-bold text-navy-900 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:text-muted/40 disabled:hover:bg-white`}
      >
        −
      </button>
      <span
        className={`${val} border-x border-line text-center font-bold tabular-nums text-navy-900`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange?.(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className={`${btn} bg-white font-bold text-navy-900 transition-colors hover:bg-sky-50 disabled:cursor-not-allowed disabled:text-muted/40 disabled:hover:bg-white`}
      >
        +
      </button>
    </div>
  );
}
