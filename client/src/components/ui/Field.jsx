/**
 * Field — a labelled form input.
 *
 * Not in the original primitive list, but the shell needs it (footer
 * newsletter, postcode checker) and Phase 7 replaces FloatingInput
 * with exactly this, so it may as well exist once.
 *
 * Plain label above input, no floating-label animation. Floating
 * labels look clever and cost you: they shrink the label to 11px at
 * the moment the user most needs to read it, and they break browser
 * autofill styling. A 58px input with a real label above it is the
 * right call for a service business.
 *
 * Renders <input>, <textarea> or <select> via `as`.
 */
export default function Field({
  id,
  label,
  hint,
  error,
  as = 'input',
  className = '',
  wrapperClassName = '',
  children,
  ...rest
}) {
  const Tag = as;
  const isTextarea = as === 'textarea';
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
        className={`w-full rounded-btn border bg-white px-[18px] text-base text-ink placeholder:text-[#93a4b3] lg:text-[17px] ${
          isTextarea ? 'min-h-[140px] resize-y py-4 leading-[1.6]' : 'h-[58px]'
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
