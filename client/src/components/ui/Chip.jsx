/**
 * Chip — a selectable pill. Filters, category toggles, quick picks.
 *
 * Chips are *controls*: they change what's on screen. If the thing
 * only describes state and can't be clicked, it's a <Tag>, not a Chip.
 * Renders as <button> by default so keyboard users get it for free.
 */
export default function Chip({
  active = false,
  as: Tag = 'button',
  className = '',
  children,
  ...rest
}) {
  const isButton = Tag === 'button';

  return (
    <Tag
      {...(isButton ? { type: 'button', 'aria-pressed': active } : {})}
      className={`inline-flex items-center gap-[7px] rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'border-navy-900 bg-navy-900 text-white'
          : 'border-line bg-white text-ink hover:border-navy-500'
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
