import { BasketIcon } from '../booking/icons.jsx';
import { ClockIcon } from '../home/icons.jsx';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

// kg-priced services step by weight; everything else is a simple count.
const isWeight = (unit) => /kg/i.test(unit || '');

/**
 * One laundry service as a catalogue row with a quantity/weight stepper.
 * Controlled by the parent estimate builder: `qty` in, `onQty(next)` out.
 *
 * Phase 4 restyle. This row also renders inside booking step 1
 * (`booking/StepBuildLaundry`), which is why it was still on the v1
 * palette after Phase 6 — it lives in `laundry/`, so it belongs to this
 * phase. Props and behaviour are untouched.
 *
 * Selection is signalled with a gold-tinted thumbnail rather than the
 * old aqua ring: gold is the action colour, and "I've added this" is
 * the one bit of state on the row worth colouring.
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
      className={`flex items-center gap-3.5 border-b border-line py-4 transition-all duration-500 ease-out last:border-b-0 ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      {/* Thumbnail — photo, the admin's chosen emoji, or the basket glyph. */}
      <div
        className={`grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-btn text-2xl transition-colors ${
          selected
            ? 'bg-gold-100 text-navy-900 shadow-[inset_0_0_0_2px_var(--color-gold-500)]'
            : 'bg-sky-100 text-navy-700'
        }`}
      >
        {photo ? (
          <img src={service.image} alt={service.name} loading="lazy" className="h-full w-full object-cover" />
        ) : service.image ? (
          <span aria-hidden="true">{service.image}</span>
        ) : (
          <BasketIcon width={22} height={22} aria-hidden="true" />
        )}
      </div>

      {/* Name · description · estimated price */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-bold text-ink">{service.name}</h3>
          {service.turnaround && (
            <span className="hidden flex-none items-center gap-1 rounded-full bg-sky-50 px-2 py-1 text-[11px] font-bold leading-none text-navy-700 sm:inline-flex">
              <ClockIcon width={12} height={12} aria-hidden="true" />
              {service.turnaround}
            </span>
          )}
        </div>
        {service.description && (
          <p className="mt-1 line-clamp-1 text-[13px] leading-[1.5] text-muted">{service.description}</p>
        )}
        <p className="mt-1.5 font-display text-[15px] font-bold leading-none text-navy-900">
          ~${price.toFixed(2)}
          {service.unit && <span className="ml-1 text-[12px] font-medium text-muted">· {service.unit}</span>}
        </p>
      </div>

      {/* Stepper (+ running line total once added) */}
      <div className="flex flex-none flex-col items-end gap-1.5">
        <div className="inline-flex items-center overflow-hidden rounded-btn border border-line bg-white">
          <button
            type="button"
            onClick={dec}
            disabled={qty === 0}
            aria-label={`Remove one ${service.name}`}
            className="flex h-10 w-10 items-center justify-center bg-sky-50 text-lg font-bold text-navy-900 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:text-muted/50 disabled:hover:bg-sky-50"
          >
            −
          </button>
          <span
            className={`min-w-[3.5rem] px-1 text-center text-sm font-extrabold tabular-nums ${
              selected ? 'text-navy-900' : 'text-muted'
            }`}
          >
            {amount}
          </span>
          <button
            type="button"
            onClick={inc}
            aria-label={`Add one ${service.name}`}
            className="flex h-10 w-10 items-center justify-center bg-sky-50 text-lg font-bold text-navy-900 transition-colors hover:bg-sky-100"
          >
            +
          </button>
        </div>
        {selected && (
          <span className="bc-fade-in text-[12px] font-bold tabular-nums text-navy-500">
            ${(price * qty).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
