import { useState } from 'react';
import Button from '../ui/Button.jsx';
import { BubblesIcon, SparkleIcon, CheckIcon } from '../booking/icons.jsx';
import { ClockIcon } from '../home/icons.jsx';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

/**
 * One cleaning service as a card on /cleaning.
 *
 * Phase 4 restyle. v1 gave this card its own emerald/teal scheme with a
 * blurred glow, a shine sweep on hover and two gradients — a second
 * brand living inside the first. v2 is the same card shape as
 * `products/ProductCard`: white, hairline border, image band flush to
 * the top, price and a small button on the footer rule.
 *
 * Composition, props and the add-then-navigate behaviour are unchanged.
 */
export default function CleaningServiceCard({ service, index = 0, mounted = true, onAdd, canBook = true }) {
  const [added, setAdded] = useState(false);
  const photo = isPhoto(service.image);
  const byHomeSize = service.pricingMode === 'home';
  const Glyph = service.isAddon ? SparkleIcon : BubblesIcon;

  const handleAdd = () => {
    onAdd?.(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      style={{ transitionDelay: `${index * 70}ms` }}
      className={`bc-card-light group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-500 ease-out hover:shadow-lift ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      {/* Image band — photo, the admin's chosen emoji, or the service glyph. */}
      <div className="relative grid h-40 place-items-center overflow-hidden border-b border-line bg-sky-100 text-navy-700">
        {photo ? (
          <img
            src={service.image}
            alt={service.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : service.image ? (
          <span aria-hidden="true" className="text-6xl">
            {service.image}
          </span>
        ) : (
          <Glyph width={44} height={44} aria-hidden="true" />
        )}

        {service.duration && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold leading-none text-navy-700 shadow-card">
            <ClockIcon width={13} height={13} aria-hidden="true" />
            {service.duration}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="bc-h4">{service.name}</h3>
        {service.description && (
          <p className="line-clamp-2 text-[15px] leading-[1.5] text-muted">{service.description}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2.5 pt-3.5">
          <span className="flex items-baseline gap-1.5">
            {byHomeSize && <span className="bc-meta text-muted">from</span>}
            <span className="font-display text-[22px] font-bold leading-tight text-navy-900">
              ${Number(service.price || 0).toFixed(2)}
            </span>
            {service.unit && (
              <span className="bc-meta text-muted">
                {byHomeSize ? '1 bed · 1 bath' : service.unit}
              </span>
            )}
          </span>

          {canBook && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdd}
              aria-label={`Book ${service.name}`}
            >
              {added ? (
                <>
                  <CheckIcon width={16} height={16} /> Added
                </>
              ) : (
                'Book'
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
