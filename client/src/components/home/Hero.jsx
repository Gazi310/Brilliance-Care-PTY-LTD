import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, StarIcon } from './icons';

/**
 * Homepage hero: brand promise, primary + secondary CTAs, trust line,
 * and a postcode "do we service your area?" check (client-side for now).
 */
export default function Hero() {
  const [postcode, setPostcode] = useState('');
  const [areaResult, setAreaResult] = useState(null); // null | 'ok' | 'invalid'

  const checkArea = (e) => {
    e.preventDefault();
    setAreaResult(/^\d{4}$/.test(postcode.trim()) ? 'ok' : 'invalid');
  };

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="bc-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-d to-aqua-d px-6 py-10 text-white shadow-cta sm:px-10 sm:py-14 lg:px-14 lg:py-20">
        {/* soft radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(460px 240px at 80% 8%, rgba(255,255,255,.25), transparent 60%)',
          }}
        />
        <div className="relative z-10 max-w-xl">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/80">
            Brilliance Care
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            Fresh laundry &amp; sparkling homes — from your door.
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/90 sm:text-base">
            We pick up, clean, and deliver. Pay a small deposit now, the rest
            after — with a clear, honest invoice.
          </p>

          {/* Primary + secondary CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/laundry"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              Book a pickup
              <ArrowRight width={18} height={18} />
            </Link>
            <Link
              to="/laundry"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/40 backdrop-blur transition hover:bg-white/25"
            >
              Browse services
            </Link>
          </div>

          {/* Trust line */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <StarIcon className="text-amber-300" />
              4.9 average rating
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              2,000+ happy customers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              30+ Sydney suburbs
            </span>
          </div>
        </div>
      </section>

      {/* ============ POSTCODE / AREA CHECK ============ */}
      <section className="relative z-20 -mt-6 px-1 sm:-mt-8">
        <form
          onSubmit={checkArea}
          className="mx-auto flex max-w-xl items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-soft"
        >
          <span className="pl-2 text-lg" aria-hidden="true">
            📍
          </span>
          <input
            inputMode="numeric"
            maxLength={4}
            value={postcode}
            onChange={(e) => {
              setPostcode(e.target.value.replace(/\D/g, ''));
              setAreaResult(null);
            }}
            placeholder="Enter your postcode — do we service your area?"
            className="min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-faint"
            aria-label="Postcode"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-gradient-to-r from-navy to-aqua px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-95 active:translate-y-px"
          >
            Check area
          </button>
        </form>
        {areaResult && (
          <p
            className={`bc-fade-in mx-auto mt-2 max-w-xl px-3 text-center text-sm font-semibold ${
              areaResult === 'ok' ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {areaResult === 'ok'
              ? `Great news — we service ${postcode}! Book a pickup to get started.`
              : 'Please enter a valid 4-digit Australian postcode.'}
          </p>
        )}
      </section>
    </>
  );
}
