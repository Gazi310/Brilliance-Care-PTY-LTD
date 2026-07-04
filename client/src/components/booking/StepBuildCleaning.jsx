import QtyStepper from './QtyStepper.jsx';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

const round2 = (n) => Math.round(n * 100) / 100;

function Thumb({ image, fallback }) {
  return (
    <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl bg-surface text-2xl">
      {isPhoto(image) ? <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span>{image || fallback}</span>}
    </div>
  );
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
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white py-16 text-center shadow-soft">
        <span className="text-5xl">🫧</span>
        <p className="mt-4 text-base font-semibold text-muted">No cleaning services yet</p>
        <p className="text-sm text-faint">Please check back soon.</p>
      </div>
    );
  }

  const beds = Math.max(1, cleaning.bedrooms || 1);
  const baths = Math.max(1, cleaning.bathrooms || 1);

  return (
    <div className="space-y-4">
      {/* ---- Cleaning type (radio cards) ---- */}
      <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Cleaning type</p>
        <div className="mt-3 space-y-2">
          {types.map((s) => {
            const active = s._id === cleaning.serviceId;
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => setCleaningService(active ? null : s._id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  active ? 'border-aqua bg-aqua/10 ring-1 ring-aqua' : 'border-line bg-white hover:bg-surface/60'
                }`}
              >
                <Thumb image={s.image} fallback="🫧" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">{s.name}</p>
                  <p className="line-clamp-1 text-xs text-muted">{s.description}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-ink">
                    from ~${Number(s.price || 0).toFixed(2)}
                    <span className="font-medium text-faint"> · {s.duration}</span>
                  </p>
                </div>
                <span
                  className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                    active ? 'border-aqua bg-aqua text-white' : 'border-line text-transparent'
                  }`}
                >
                  ✓
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- Home size (for 'home' pricing) or quantity (flat) ---- */}
      {selected && selected.pricingMode === 'home' && (
        <section className="bc-fade-up rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Your home</p>
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">🛏 Bedrooms</p>
                {selected.perBedroom > 0 && (
                  <p className="text-[11px] text-faint">+${Number(selected.perBedroom).toFixed(2)} per extra bedroom</p>
                )}
              </div>
              <QtyStepper value={beds} min={1} max={8} onChange={(v) => setCleaningField('bedrooms', v)} label="bedrooms" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">🛁 Bathrooms</p>
                {selected.perBathroom > 0 && (
                  <p className="text-[11px] text-faint">+${Number(selected.perBathroom).toFixed(2)} per extra bathroom</p>
                )}
              </div>
              <QtyStepper value={baths} min={1} max={6} onChange={(v) => setCleaningField('bathrooms', v)} label="bathrooms" />
            </div>
            <p className="rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-muted">
              {selected.name} · {beds} bed · {baths} bath — ~$
              {round2(
                Number(selected.price || 0) +
                  Number(selected.perBedroom || 0) * (beds - 1) +
                  Number(selected.perBathroom || 0) * (baths - 1)
              ).toFixed(2)}
            </p>
          </div>
        </section>
      )}

      {selected && selected.pricingMode !== 'home' && (
        <section className="bc-fade-up rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-ink">How many? </p>
              <p className="text-[11px] text-faint">${Number(selected.price || 0).toFixed(2)} {selected.unit}</p>
            </div>
            <QtyStepper value={Math.max(1, cleaning.qty || 1)} min={1} max={20} onChange={(v) => setCleaningField('qty', v)} />
          </div>
        </section>
      )}

      {/* ---- Add-ons ---- */}
      {addons.length > 0 && (
        <section className="bc-fade-up rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Add-ons</p>
          {!selected && Object.keys(cleaning.addons).length > 0 && (
            <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              ⚠️ Add-ons ride along with a main clean — pick a cleaning type above to include them.
            </p>
          )}
          <div className="mt-3 space-y-2">
            {addons.map((s) => {
              const qty = cleaning.addons[s._id] || 0;
              const active = qty > 0;
              const perRoom = /room/i.test(s.unit || '');
              return (
                <div
                  key={s._id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    active ? 'border-aqua/60 bg-aqua/5' : 'border-line'
                  }`}
                >
                  <Thumb image={s.image} fallback="✨" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{s.name}</p>
                    <p className="text-[12px] font-semibold text-muted">
                      ~${Number(s.price || 0).toFixed(2)} <span className="font-medium text-faint">· {s.unit}</span>
                    </p>
                  </div>
                  {active && perRoom ? (
                    <QtyStepper value={qty} min={0} max={12} onChange={(v) => setAddonQty(s._id, v)} label={s.name} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddonQty(s._id, active ? 0 : 1)}
                      className={`flex-none rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                        active
                          ? 'bg-aqua text-white'
                          : 'bg-surface text-navy hover:bg-line'
                      }`}
                    >
                      {active ? '✓ Added' : '+ Add'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
