/**
 * Stepper — the progress header for the 4-step booking flow.
 *
 * States: done (solid navy dot), current (gold dot + gold underline),
 * upcoming (grey). Labels disappear on mobile and only the numbered
 * dots remain — four labels don't fit at 390px and truncating them
 * is worse than dropping them.
 *
 * Display only. It doesn't own navigation; BookingFlow does.
 *
 * steps:   ['Build', 'Schedule', 'Details', 'Review']
 * current: zero-based index
 */
export default function Stepper({ steps = [], current = 0, className = '' }) {
  return (
    <ol
      className={`mb-10 flex border-b border-line ${className}`}
      aria-label={`Step ${current + 1} of ${steps.length}`}
    >
      {steps.map((label, i) => {
        const done = i < current;
        const on = i === current;

        return (
          <li
            key={label}
            aria-current={on ? 'step' : undefined}
            className={`relative flex-1 pb-[18px] text-center text-sm font-semibold leading-[1.4] ${
              on ? 'text-navy-900' : 'text-muted'
            }`}
          >
            <span
              className={`mx-auto grid h-[34px] w-[34px] place-items-center rounded-full text-sm font-bold leading-none lg:mb-2.5 ${
                on
                  ? 'bg-gold-500 text-navy-900'
                  : done
                    ? 'bg-navy-900 text-white'
                    : 'bg-line text-muted'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>

            {/* Label is hidden on mobile — dots carry the meaning there. */}
            <span className="hidden lg:inline">{label}</span>

            {on && <span className="absolute inset-x-0 -bottom-px h-[3px] bg-gold-500" />}
          </li>
        );
      })}
    </ol>
  );
}
