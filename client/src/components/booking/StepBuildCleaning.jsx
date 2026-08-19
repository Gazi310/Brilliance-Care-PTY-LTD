import { Card, IconBadge, Notice } from '../ui';
import QtyStepper from './QtyStepper.jsx';
import { BathIcon, BedIcon, BubblesIcon, CheckIcon, PlusIcon, SparkleIcon } from './icons.jsx';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * A service thumbnail. Real photo if the catalogue has one; otherwise the
 * fallback line icon in a tinted disc. (Admins can still store a character
 * in `image`, which renders as-is — that's catalogue data, not chrome.)
 */
function Thumb({ image, fallback, tone = 'sky' }) {
  if (isPhoto(image)) {
    return (
      <div className="h-12 w-12 flex-none overflow-hidden rounded-full bg-sky-50">
        <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
    );
  }
  if (image) {
    return (
      <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-full bg-sky-50 text-2xl">
        <span>{image}</span>
      </div>
    );
  }
  return <IconBadge size="inline" tone={tone} icon={fallback} />;
}

/**
 * Booking step 1 (cleaning) — blueprint §4.5: type + home size + add-ons.
 *  - Pick ONE cleaning type (radio cards).
 *  - 'home'-priced types size the estimate by bedrooms & bathrooms.
 *  - 'flat' types use a simple quantity.
 *  - Add-on extras (oven, windows, carpet…) stack on top.
 */
export default function StepBuildCleaning({ services, cleaning, setCleaningService, setCleaningField, setAddonQty }) {
  const types = services.filter((s) => !s.isAddon);
  const addons = services.filter((s) => s.isAddon);
  const selected = types.find((s) => s._id === cleaning.serviceId) || null;

  if (!types.length) {
    return (
      <div className="bc-card-light flex flex-col items-center justify-center rounded-card border border-line bg-white py-16 text-center shadow-card">
        <IconBadge icon={BubblesIcon} tone="navy" />
        <p className="bc-h4">No cleaning services yet</p>
        <p className="mt-1 text-sm text-muted">Please check back soon.</p>
      </div>
    );
  }

  const beds = Math.max(1, cleaning.bedrooms || 1);
  const baths = Math.max(1, cleaning.bathrooms || 1);

  return (
    <div className="space-y-4">
      {/* ---- Cleaning type (radio cards) ---- */}
      <Card as="section">
        <p className="bc-eyebrow">Cleaning type</p>
        <div className="mt-4 space-y-2.5">
          {types.map((s) => {
            const active = s._id === cleaning.serviceId;
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => setCleaningService(active ? null : s._id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3.5 rounded-btn border p-3.5 text-left transition ${
                  active ? 'border-navy-900 bg-sky-50 ring-1 ring-navy-900' : 'border-line bg-white hover:bg-sky-50'
                }`}
              >
                <Thumb image={s.image} fallback={BubblesIcon} tone="navy" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-navy-900">{s.name}</p>
                  <p className="line-clamp-1 text-[13px] text-muted">{s.description}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-ink">
                    from ~${Number(s.price || 0).toFixed(2)}
                    <span className="font-medium text-muted"> · {s.duration}</span>
                  </p>
                </div>
                <span
                  className={`grid h-5 w-5 flex-none place-items-center rounded-full border-2 ${
                    active ? 'border-navy-900 bg-navy-900 text-white' : 'border-line text-transparent'
                  }`}
                >
                  <CheckIcon width={11} height={11} aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ---- Home size (for 'home' pricing) or quantity (flat) ---- */}
      {selected && selected.pricingMode === 'home' && (
        <Card as="section" className="bc-fade-up">
          <p className="bc-eyebrow">Your home</p>
          <div className="mt-4 space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <BedIcon className="flex-none text-navy-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-navy-900">Bedrooms</p>
                  {selected.perBedroom > 0 && (
                    <p className="text-xs text-muted">+${Number(selected.perBedroom).toFixed(2)} per extra bedroom</p>
                  )}
                </div>
              </div>
              <QtyStepper value={beds} min={1} max={8} onChange={(v) => setCleaningField('bedrooms', v)} label="bedrooms" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <BathIcon className="flex-none text-navy-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-navy-900">Bathrooms</p>
                  {selected.perBathroom > 0 && (
                    <p className="text-xs text-muted">+${Number(selected.perBathroom).toFixed(2)} per extra bathroom</p>
                  )}
                </div>
              </div>
              <QtyStepper value={baths} min={1} max={6} onChange={(v) => setCleaningField('bathrooms', v)} label="bathrooms" />
            </div>
            <p className="rounded-btn bg-sky-50 px-4 py-2.5 text-[13px] font-semibold text-muted">
              {selected.name} · {beds} bed · {baths} bath — ~$
              {round2(
                Number(selected.price || 0) +
                  Number(selected.perBedroom || 0) * (beds - 1) +
                  Number(selected.perBathroom || 0) * (baths - 1)
              ).toFixed(2)}
            </p>
          </div>
        </Card>
      )}

      {selected && selected.pricingMode !== 'home' && (
        <Card as="section" className="bc-fade-up">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-bold text-navy-900">How many?</p>
              <p className="text-xs text-muted">${Number(selected.price || 0).toFixed(2)} {selected.unit}</p>
            </div>
            <QtyStepper value={Math.max(1, cleaning.qty || 1)} min={1} max={20} onChange={(v) => setCleaningField('qty', v)} />
          </div>
        </Card>
      )}

      {/* ---- Add-ons ---- */}
      {addons.length > 0 && (
        <Card as="section" className="bc-fade-up">
          <p className="bc-eyebrow">Add-ons</p>
          {!selected && Object.keys(cleaning.addons).length > 0 && (
            <Notice tone="warn" className="mt-3">
              Add-ons ride along with a main clean — pick a cleaning type above to include them.
            </Notice>
          )}
          <div className="mt-4 space-y-2.5">
            {addons.map((s) => {
              const qty = cleaning.addons[s._id] || 0;
              const active = qty > 0;
              const perRoom = /room/i.test(s.unit || '');
              return (
                <div
                  key={s._id}
                  className={`flex items-center gap-3.5 rounded-btn border p-3.5 transition ${
                    active ? 'border-navy-500/50 bg-sky-50' : 'border-line'
                  }`}
                >
                  <Thumb image={s.image} fallback={SparkleIcon} tone="gold" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-navy-900">{s.name}</p>
                    <p className="text-[13px] font-semibold text-ink">
                      ~${Number(s.price || 0).toFixed(2)} <span className="font-medium text-muted">· {s.unit}</span>
                    </p>
                  </div>
                  {active && perRoom ? (
                    <QtyStepper value={qty} min={0} max={12} onChange={(v) => setAddonQty(s._id, v)} label={s.name} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddonQty(s._id, active ? 0 : 1)}
                      className={`inline-flex flex-none items-center gap-1.5 rounded-btn px-4 py-2.5 text-[13px] font-bold transition active:scale-95 ${
                        active
                          ? 'bg-navy-900 text-white hover:bg-navy-800'
                          : 'bg-sky-100 text-navy-900 hover:bg-sky-100/70'
                      }`}
                    >
                      {active ? (
                        <CheckIcon width={13} height={13} aria-hidden="true" />
                      ) : (
                        <PlusIcon width={13} height={13} aria-hidden="true" />
                      )}
                      {active ? 'Added' : 'Add'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
