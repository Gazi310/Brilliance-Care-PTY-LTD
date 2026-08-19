/**
 * Field — a labelled form input.
 *
 * Not in the original primitive list, but the shell needs it (footer
 * newsletter, postcode checker) and Phase 7 retired the old
 * FloatingInput in favour of exactly this, so it exists once.
 *
 * Plain label above input, no floating-label animation. Floating
 * labels look clever and cost you: they shrink the label to 11px at
 * the moment the user most needs to read it, and they break browser
 * autofill styling. A 58px input with a real label above it is the
 * right call for a service business.
 *
 * Renders <input>, <textarea> or <select> via `as`.
 *
 * `size="sm"` drops the control to 44px and 15px text. That's for the
 * admin screens only: a work queue puts six inputs in a row where the
 * customer site puts one, and a 58px field there pushes the actual
 * data below the fold. Customer-facing forms keep the default.
 */

const SIZES = {
  default: { input: 'h-[58px] text-base lg:text-[17px]', area: 'min-h-[140px] py-4 text-base lg:text-[17px]' },
  sm: { input: 'h-11 text-[15px]', area: 'min-h-[96px] py-3 text-[15px]' },
};

export default function Field({
  id,
  label,
  hint,
  error,
  as = 'input',
  size = 'default',
  className = '',
  wrapperClassName = '',
  children,
  ...rest
}) {
  const Tag = as;
  const isTextarea = as === 'textarea';
  const s = SIZES[size] ?? SIZES.default;
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ');

  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold leading-[1.3] text-navy-900">
          {label}
        </label>
      )}

      <Tag
        id={id}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-btn border bg-white px-[18px] text-ink placeholder:text-[#93a4b3] ${
          isTextarea ? `resize-y leading-[1.6] ${s.area}` : s.input
        } ${error ? 'border-bad' : 'border-line'} ${className}`}
        {...rest}
      >
        {children}
      </Tag>

      {hint && !error && (
        <p id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-[13px] font-medium text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
