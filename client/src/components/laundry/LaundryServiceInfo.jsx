import Button from '../ui/Button.jsx';
import { BasketIcon } from '../booking/icons.jsx';
import { ClockIcon } from '../home/icons.jsx';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

/**
 * A roomy, descriptive laundry service card for the /laundry overview page.
 * Shows the full detailed description so customers understand exactly what the
 * service includes, with a Book button into the booking flow (/book/laundry).
 *
 * Phase 4 restyle: same two-column composition, v2 surface. The Book
 * button is `outline` rather than gold — there can be eight of these on
 * the page and the gold belongs to the closing CTA.
 *
 * The entrance is `bc-fade-up` with a per-card delay rather than a
 * `mounted` prop toggled from an effect. The parent only renders these
 * once the catalogue has loaded, so the animation plays on mount either
 * way — and this version honours `prefers-reduced-motion`.
 */
export default function LaundryServiceInfo({ service, index = 0, bookTo = '/book/laundry' }) {
  const photo = isPhoto(service.image);
  const price = Number(service.price || 0);

  return (
    <article
      style={{ animationDelay: `${index * 60}ms` }}
      className="bc-card-light bc-fade-up group flex h-full flex-col gap-5 rounded-card border border-line bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-lift sm:flex-row lg:p-6"
    >
      {/* Image — photo, the admin's chosen emoji, or the basket glyph. */}
      <div className="relative grid h-36 w-full flex-none place-items-center overflow-hidden rounded-img bg-sky-100 text-navy-700 sm:h-[124px] sm:w-[124px]">
        {photo ? (
          <img
            src={service.image}
            alt={service.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : service.image ? (
          <span aria-hidden="true" className="text-5xl">
            {service.image}
          </span>
        ) : (
          <BasketIcon width={38} height={38} aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="bc-h3">{service.name}</h3>
          {service.turnaround && (
            <span className="inline-flex flex-none items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold leading-none text-navy-700">
              <ClockIcon width={13} height={13} aria-hidden="true" />
              {service.turnaround}
            </span>
          )}
        </div>

        {service.description && (
          <p className="mt-2.5 text-[15px] leading-[1.6] text-muted">{service.description}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 sm:mt-auto sm:pt-4">
          <span className="flex items-baseline gap-1.5">
            <span className="bc-meta text-muted">from</span>
            <span className="font-display text-[22px] font-bold leading-none text-navy-900">
              ~${price.toFixed(2)}
            </span>
            {service.unit && <span className="bc-meta text-muted">{service.unit}</span>}
          </span>
          <Button variant="outline" size="sm" to={bookTo}>
            Book
          </Button>
        </div>
      </div>
    </article>
  );
}
