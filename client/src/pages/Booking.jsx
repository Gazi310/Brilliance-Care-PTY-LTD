import { Link, Navigate, useParams } from 'react-router-dom';
import BookingFlow from '../components/booking/BookingFlow.jsx';

/** /book — pick what to book; /book/:service — the guided 4-step flow. */
export default function Booking() {
  const { service } = useParams();

  if (service && service !== 'laundry' && service !== 'cleaning') {
    return <Navigate to="/book" replace />;
  }

  if (service) return <BookingFlow service={service} />;

  /* ---- Chooser ---- */
  const options = [
    {
      to: '/book/laundry',
      icon: '🧺',
      title: 'Laundry pickup',
      blurb: 'Wash & fold, ironing, duvets — collected and returned to your door.',
      chip: 'Priced per load · pickup included',
    },
    {
      to: '/book/cleaning',
      icon: '🫧',
      title: 'Home or office clean',
      blurb: 'Standard, deep or end-of-lease cleans, sized to your home.',
      chip: 'Sized by bedrooms & bathrooms',
    },
  ];

  return (
    <main className="min-h-screen bg-surface pb-28 lg:pb-16">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <section className="bc-fade-up relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-d to-aqua-d px-6 py-8 text-white shadow-cta sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(420px 220px at 85% 0%, rgba(255,255,255,.22), transparent 60%)' }}
          />
          <div className="relative z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/80">Book a service</span>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
              What can we take off your plate?
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/90">
              Build your order, see an instant estimate, and secure your spot with a small deposit.
            </p>
          </div>
        </section>

        <div className="mt-5 space-y-3">
          {options.map((o, i) => (
            <Link
              key={o.to}
              to={o.to}
              style={{ animationDelay: `${i * 80}ms` }}
              className="bc-fade-up flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-cta sm:p-5"
            >
              <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-mint/25 text-3xl">
                {o.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-extrabold text-ink">{o.title}</span>
                <span className="mt-0.5 block text-sm text-muted">{o.blurb}</span>
                <span className="mt-1.5 inline-block rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-bold text-navy">
                  {o.chip}
                </span>
              </span>
              <span className="text-xl text-faint">›</span>
            </Link>
          ))}
        </div>

        <p className="mt-5 px-1 text-center text-xs text-faint">
          After products instead?{' '}
          <Link to="/products" className="font-bold text-aqua-d underline-offset-2 hover:underline">
            Visit the shop
          </Link>{' '}
          — paid in full, no deposit.
        </p>
      </div>
    </main>
  );
}
