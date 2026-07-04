import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LaundryServiceInfo from './LaundryServiceInfo.jsx';

const BOOK_TO = '/laundry/book';

/**
 * The /laundry overview: introduces every laundry service with a description
 * and a Book button. Booking (choosing quantities & estimate) happens on the
 * catalogue page at /laundry/book.
 */
export default function LaundryOverview({ services = [], loading, error, onRetry }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!loading) setMounted(true);
  }, [loading]);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="bc-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-d to-aqua-d px-6 py-9 text-white shadow-cta sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(460px 240px at 82% 4%, rgba(255,255,255,.22), transparent 60%)' }}
        />
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/80">Laundry</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/95 px-3 py-1 text-[11px] font-extrabold text-amber-900">
              💡 Est. prices
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Fresh laundry &amp; ironing, picked up from your door.
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
            From everyday wash &amp; fold to delicates and dry cleaning — we collect, clean and return it.
            Browse what we offer, then book a pickup in a couple of taps.
          </p>
          <div className="mt-6">
            <Link
              to={BOOK_TO}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              Book a pickup
              <span className="text-base leading-none">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SERVICE CARDS ================= */}
      <section className="mt-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {error}
            <button onClick={onRetry} className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200">
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft">
                <div className="bc-skeleton h-28 w-28 flex-none rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="bc-skeleton h-4 w-2/3 rounded" />
                  <div className="bc-skeleton h-3 w-full rounded" />
                  <div className="bc-skeleton h-3 w-5/6 rounded" />
                  <div className="bc-skeleton h-8 w-1/2 rounded" />
                </div>
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
          <>
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-extrabold tracking-tight text-ink">Our services</h2>
              <span className="text-sm text-muted">Prices are estimates — pay a deposit to book.</span>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {services.map((s, i) => (
                <LaundryServiceInfo key={s._id} service={s} index={i} mounted={mounted} bookTo={BOOK_TO} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ============ CLOSING CTA ============ */}
      {!loading && !error && services.length > 0 && (
        <section className="mt-8">
          <Link
            to={BOOK_TO}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-navy to-aqua px-6 py-4 text-base font-bold text-white shadow-cta transition hover:-translate-y-0.5"
          >
            Book your pickup
            <span className="text-lg leading-none">→</span>
          </Link>
        </section>
      )}
    </>
  );
}
