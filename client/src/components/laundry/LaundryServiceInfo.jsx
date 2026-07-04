import { Link } from 'react-router-dom';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

/**
 * A roomy, descriptive laundry service card for the /laundry overview page.
 * Shows the full detailed description so customers understand exactly what the
 * service includes, with a Book button into the booking flow (/book/laundry).
 */
export default function LaundryServiceInfo({ service, index = 0, mounted = true, bookTo = '/book/laundry' }) {
  const photo = isPhoto(service.image);
  const price = Number(service.price || 0);

  return (
    <div
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`group flex h-full flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-cta sm:flex-row sm:p-5 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      {/* Image / emoji */}
      <div className="relative flex h-32 w-full flex-none items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-navy/5 to-aqua/15 sm:h-28 sm:w-28">
        {photo ? (
          <img
            src={service.image}
            alt={service.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="text-5xl drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6">
            {service.image || '🧺'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-ink sm:text-lg">{service.name}</h3>
          {service.turnaround && (
            <span className="flex-none rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-aqua-d">
              ⏱ {service.turnaround}
            </span>
          )}
        </div>

        {service.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{service.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 pt-1 sm:mt-auto">
          <span className="flex items-baseline gap-1">
            <span className="text-[11px] font-semibold text-faint">from</span>
            <span className="text-xl font-extrabold text-ink">~${price.toFixed(2)}</span>
            {service.unit && <span className="text-[11px] font-medium text-faint">{service.unit}</span>}
          </span>
          <Link
            to={bookTo}
            className="inline-flex flex-none items-center gap-1.5 rounded-xl bg-gradient-to-r from-navy to-aqua px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            Book
            <span className="text-base leading-none">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
