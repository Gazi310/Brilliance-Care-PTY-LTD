/**
 * Band — one full-width horizontal section of a page.
 *
 * Every v2 page is a stack of Bands. The band owns the background
 * colour and the vertical rhythm; nothing inside it should set its
 * own section padding. This is what stops each page inventing its
 * own spacing, which is most of why v1 felt inconsistent.
 *
 * Rhythm: 64px mobile / 112px desktop (size="default"),
 *         48px mobile /  72px desktop (size="sm").
 *
 * `question` is the client-demo affordance carried over from the
 * wireframes: it labels the band with the question that section
 * answers. Off unless VITE_SHOW_BAND_NOTES is set, so it can ship.
 */

const TONES = {
  white: 'bg-white',
  sky: 'bg-sky-100',
  tint: 'bg-sky-50',
  sand: 'bg-sand-50',
  navy: 'bg-navy-900 text-white bc-on-navy',
};

const SIZES = {
  default: 'py-16 lg:py-28',
  sm: 'py-12 lg:py-[72px]',
  none: '',
};

const SHOW_NOTES = import.meta.env?.VITE_SHOW_BAND_NOTES === '1';

export default function Band({
  tone = 'white',
  size = 'default',
  question,
  as: Tag = 'section',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`relative px-5 lg:px-20 ${TONES[tone] ?? TONES.white} ${
        SIZES[size] ?? SIZES.default
      } ${className}`}
      {...rest}
    >
      {SHOW_NOTES && question && (
        <span className="absolute left-0 top-0 z-20 max-w-full truncate rounded-br-[10px] bg-gold-500 px-3 py-1.5 text-[10.5px] font-extrabold uppercase leading-none tracking-[0.1em] text-navy-900">
          {question}
        </span>
      )}
      {children}
    </Tag>
  );
}
