import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  StarIcon,
  ShieldIcon,
  LeafIcon,
  TruckIcon,
} from './icons';

const STEPS = [
  {
    n: 1,
    t: 'Book & pay 30% deposit',
    s: 'Prices are estimates — you only pay part now.',
  },
  {
    n: 2,
    t: 'We collect & clean',
    s: 'We weigh and assess the real job as we go.',
  },
  {
    n: 3,
    t: 'Pay balance, delivered',
    s: 'We send a clear invoice, then return it fresh.',
  },
];

const REVIEWS = [
  {
    emoji: '💬',
    quote:
      'Booked in a minute, loved the pickup reminder and the honest final invoice.',
    name: 'Priya',
    place: 'Parramatta',
  },
  {
    emoji: '✨',
    quote:
      'House looked brand new after the deep clean. No surprises on the price.',
    name: 'Daniel',
    place: 'Chatswood',
  },
];

const BADGES = [
  { Icon: ShieldIcon, label: 'Fully insured' },
  { Icon: LeafIcon, label: 'Eco products' },
  { Icon: TruckIcon, label: 'Free pickup & delivery' },
];

/**
 * The lower homepage sections: how-it-works, reviews, trust badges,
 * a closing desktop CTA, and a mobile sticky "Book now" bar on scroll.
 */
export default function HomeSections() {
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 420);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ================= HOW IT WORKS ================= */}
      <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-faint">
          How it works
        </div>
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:gap-6">
          {STEPS.map(({ n, t, s }) => (
            <div key={n} className="flex flex-1 items-start gap-3">
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gradient-to-br from-navy to-aqua text-sm font-extrabold text-white">
                {n}
              </div>
              <div>
                <div className="text-sm font-bold text-ink">{t}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted">
                  {s}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        {REVIEWS.map(({ emoji, quote, name, place }) => (
          <div
            key={name}
            className="flex items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft"
          >
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-surface text-xl">
              {emoji}
            </div>
            <div>
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} width={13} height={13} />
                ))}
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
                “{quote}”
              </p>
              <p className="mt-1.5 text-xs text-muted">
                {name} · {place}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ================= TRUST BADGES ================= */}
      <section className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-white px-5 py-4 shadow-soft">
        {BADGES.map(({ Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted"
          >
            <Icon className="text-aqua-d" />
            {label}
          </span>
        ))}
      </section>

      {/* ================= CLOSING CTA (desktop) ================= */}
      <section className="mt-8 hidden lg:block">
        <Link
          to="/laundry"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-navy to-aqua px-6 py-4 text-base font-bold text-white shadow-cta transition hover:-translate-y-0.5"
        >
          Book a pickup
          <ArrowRight />
        </Link>
      </section>

      {/* ============ STICKY BOTTOM CTA (mobile, on scroll) ============ */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/90 p-3 backdrop-blur transition-all duration-300 lg:hidden ${
          showStickyCta
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <Link
          to="/laundry"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-aqua px-6 py-3.5 text-sm font-bold text-white shadow-cta"
        >
          Book now
          <ArrowRight width={18} height={18} />
        </Link>
      </div>
    </>
  );
}
