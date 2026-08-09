import { StarIcon } from './icons.jsx';

/**
 * Stars — a product's rating as five gold stars plus the number.
 *
 * Gold is legal here: these are icon *fills*, not text. The numeral
 * beside them is navy, because that part is text and gold on white
 * measures 2.04:1.
 *
 * The product model has `rating` but no review count, so we don't
 * invent one — "4.8" on its own is honest, "4.8 · 63 reviews" is not.
 */
export default function Stars({ rating = 0, size = 18, className = '' }) {
  const value = Number(rating) || 0;
  const full = Math.round(value);

  if (!value) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      aria-label={`Rated ${value.toFixed(1)} out of 5`}
    >
      <span className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            width={size}
            height={size}
            className={i < full ? 'text-gold-500' : 'text-line'}
          />
        ))}
      </span>
      <span className="bc-meta font-semibold text-navy-900">{value.toFixed(1)}</span>
    </span>
  );
}
