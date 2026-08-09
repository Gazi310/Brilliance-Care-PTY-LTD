/**
 * SectionHead — the eyebrow / title / subtitle block above a section's content.
 *
 * Centred and capped at 740px on desktop, left-aligned on mobile
 * (centred short measures read as decoration on a narrow screen).
 * The 52px gap below it is part of the section rhythm — don't add
 * margin to whatever follows.
 */
export default function SectionHead({
  eyebrow,
  title,
  sub,
  align = 'center',
  className = '',
  children,
}) {
  const centred = align === 'center';

  return (
    <div
      className={`mb-7 max-w-[740px] lg:mb-[52px] ${
        centred ? 'text-left lg:mx-auto lg:text-center' : ''
      } ${className}`}
    >
      {eyebrow && <p className="bc-eyebrow">{eyebrow}</p>}
      {title && <h2 className={`bc-h2 ${eyebrow ? 'mt-2.5' : ''}`}>{title}</h2>}
      {sub && <p className="bc-lead mt-4 text-muted">{sub}</p>}
      {children}
    </div>
  );
}
