const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

// kg-priced services step by weight; everything else is a simple count.
const isWeight = (unit) => /kg/i.test(unit || '');

/**
 * One laundry service as a catalogue row with a quantity/weight stepper.
 * Controlled by the parent estimate builder: `qty` in, `onQty(next)` out.
 */
export default function LaundryServiceCard({ service, qty = 0, onQty, index = 0, mounted = true }) {
  const photo = isPhoto(service.image);
  const weight = isWeight(service.unit);
  const price = Number(service.price || 0);
  const selected = qty > 0;

  const dec = () => onQty?.(Math.max(0, qty - 1));
  const inc = () => onQty?.(qty + 1);
  const amount = weight ? `${qty} kg` : qty;

  return (
    <div
      style={{ transitionDelay: `${index * 55}ms` }}
      className={`flex items-center gap-3 border-b border-line py-3.5 transition-all duration-500 ease-out last:border-b-0 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      {/* Thumbnail */}
      <div
        className={`flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl text-2xl transition-colors ${
          selected ? 'bg-aqua/15 ring-1 ring-aqua/40' : 'bg-surface'
        }`}
      >
        {photo ? (
          <img src={service.image} alt={service.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span>{service.image || '🧺'}</span>
        )}
      </div>

      {/* Name · description · estimated price */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-ink">{service.name}</h3>
          {service.turnaround && (
            <span className="hidden flex-none rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-faint sm:inline">
              ⏱ {service.turnaround}
            </span>
          )}
        </div>
        {service.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">{service.description}</p>
        )}
        <p className="mt-1 text-[13px] font-semibold text-ink">
          ~${price.toFixed(2)}
          {service.unit && <span className="font-medium text-faint"> · {service.unit}</span>}
        </p>
      </div>

      {/* Stepper (+ running line total once added) */}
      <div className="flex flex-none flex-col items-end gap-1">
        <div className="inline-flex items-center overflow-hidden rounded-xl border border-line bg-white">
          <button
            type="button"
            onClick={dec}
            disabled={qty === 0}
            aria-label={`Remove one ${service.name}`}
            className="flex h-9 w-9 items-center justify-center bg-surface text-lg font-bold text-ink transition hover:bg-line disabled:cursor-not-allowed disabled:text-faint/50"
          >
            −
          </button>
          <span className={`min-w-[3.25rem] px-1 text-center text-sm font-extrabold tabular-nums ${selected ? 'text-navy' : 'text-faint'}`}>
            {amount}
          </span>
          <button
            type="button"
            onClick={inc}
            aria-label={`Add one ${service.name}`}
            className="flex h-9 w-9 items-center justify-center bg-surface text-lg font-bold text-ink transition hover:bg-line"
          >
            +
          </button>
        </div>
        {selected && (
          <span className="bc-fade-in text-[11px] font-bold text-aqua-d tabular-nums">
            ${(price * qty).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
