import { money } from '../orders/orderStatusMeta.js';

/**
 * The four headline numbers (blueprint §5.1): today's revenue, deposits
 * collected today, balances still out there, and bookings this week.
 */
export default function KpiGrid({ kpis }) {
  const CARDS = [
    { label: 'Revenue today', value: money(kpis.revenueToday), accent: 'text-navy' },
    { label: 'Deposits today', value: money(kpis.depositsToday), accent: 'text-aqua-d' },
    {
      label: 'Balances outstanding',
      value: money(kpis.balancesOutstanding),
      accent: kpis.balancesOutstanding > 0 ? 'text-amber-600' : 'text-ink',
    },
    { label: 'Bookings · 7 days', value: kpis.bookingsWeek, accent: 'text-ink' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {CARDS.map((c) => (
        <div key={c.label} className="rounded-2xl border border-line bg-white p-3.5 shadow-soft">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-faint">
            {c.label}
          </p>
          <p className={`mt-1.5 text-xl font-extrabold tracking-tight ${c.accent}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
