import { useEffect, useMemo, useState } from 'react';
import LaundryServiceCard from './LaundryServiceCard.jsx';

const round2 = (n) => Math.round(n * 100) / 100;
const DEPOSIT_RATE = 0.3;

/**
 * Customer-facing laundry catalogue + estimate builder.
 *
 * Renders the service list as rows with quantity steppers, keeps a live
 * estimated total, and surfaces a sticky "Continue" bar once items are added.
 * On continue it hands the chosen { service, qty } selections back to the page,
 * which adds them to the cart (where pickup & return windows are chosen).
 */
export default function LaundryCatalogue({ services = [], loading, error, onRetry, onCheckout }) {
  const [qty, setQty] = useState({}); // serviceId -> quantity
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading) setMounted(true);
  }, [loading]);

  const setServiceQty = (id, next) => setQty((q) => ({ ...q, [id]: next }));

  const selections = useMemo(
    () => services.filter((s) => (qty[s._id] || 0) > 0).map((s) => ({ service: s, qty: qty[s._id] })),
    [services, qty]
  );

  const count = useMemo(() => selections.reduce((n, x) => n + x.qty, 0), [selections]);
  const estTotal = useMemo(
    () => round2(selections.reduce((s, x) => s + Number(x.service.price || 0) * x.qty, 0)),
    [selections]
  );
  const deposit = round2(estTotal * DEPOSIT_RATE);

  const handleContinue = () => {
    if (!selections.length) return;
    onCheckout?.(selections);
    setQty({}); // items now live in the cart — reset the builder
  };

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="bc-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-d to-aqua-d px-6 py-8 text-white shadow-cta sm:px-8 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(420px 220px at 85% 0%, rgba(255,255,255,.22), transparent 60%)' }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/80">Laundry</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/95 px-3 py-1 text-[11px] font-extrabold text-amber-900">
              💡 Est. prices
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            Fresh laundry, picked up from your door.
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/90">
            Choose what needs washing and how much. We collect, clean and return it — you only pay a small
            deposit now.
          </p>
        </div>
      </section>

      {/* ============ ESTIMATE EXPLAINER ============ */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-800">
        <span aria-hidden="true" className="text-base">💡</span>
        <p>
          Prices are an <b className="font-bold text-amber-900">estimate</b>. We weigh and check your load on
          pickup — you pay a <b className="font-bold text-amber-900">30% deposit</b> now and a final balance
          after service.
        </p>
      </div>

      {/* ================= SERVICE LIST ================= */}
      <section className="mt-4">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {error}
            <button
              onClick={onRetry}
              className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-line bg-white px-4 shadow-soft">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-line py-3.5 last:border-b-0">
                <div className="bc-skeleton h-12 w-12 flex-none rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="bc-skeleton h-3.5 w-2/5 rounded" />
                  <div className="bc-skeleton h-3 w-4/5 rounded" />
                </div>
                <div className="bc-skeleton h-9 w-28 rounded-xl" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white py-20 text-center shadow-soft">
            <span className="text-5xl">🧺</span>
            <p className="mt-4 text-base font-semibold text-muted">No laundry services yet</p>
            <p className="text-sm text-faint">Please check back soon.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-white px-4 shadow-soft sm:px-5">
            {services.map((s, i) => (
              <LaundryServiceCard
                key={s._id}
                service={s}
                qty={qty[s._id] || 0}
                onQty={(next) => setServiceQty(s._id, next)}
                index={i}
                mounted={mounted}
              />
            ))}
          </div>
        )}
      </section>

      {/* ============ STICKY ESTIMATE BAR ============ */}
      {estTotal > 0 && (
        <div className="sticky bottom-4 z-30 mt-4">
          <div className="bc-fade-up flex items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-cta backdrop-blur sm:p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Estimated</span>
                <button
                  onClick={() => setQty({})}
                  className="text-[11px] font-semibold text-faint underline-offset-2 transition hover:text-muted hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="text-2xl font-extrabold tabular-nums text-ink">${estTotal.toFixed(2)}</div>
              <div className="text-[11px] text-muted">
                {count} {count === 1 ? 'item' : 'items'} · ~${deposit.toFixed(2)} deposit now
              </div>
            </div>
            <button
              onClick={handleContinue}
              className="ml-auto inline-flex flex-none items-center gap-2 rounded-xl bg-gradient-to-r from-navy to-aqua px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 sm:px-6"
            >
              Continue
              <span className="text-base leading-none">→</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
