import { money } from '../orders/orderStatusMeta.js';
import { KpiCard } from '../../ui';

/**
 * The four headline numbers (blueprint §5.1): today's revenue, deposits
 * collected today, balances still out there, and bookings this week.
 *
 * Phase 8 restyle — now the <KpiCard> primitive rather than four
 * hand-rolled boxes. v1 tinted each figure a different colour (navy,
 * aqua, amber, ink) purely for variety; v2 keeps every number navy and
 * spends colour only on the delta line, where it actually means
 * something. Balances outstanding is the one exception — money sitting
 * uncollected is the thing this dashboard exists to surface.
 */
export default function KpiGrid({ kpis }) {
  const CARDS = [
    { label: 'Revenue today', value: money(kpis.revenueToday) },
    { label: 'Deposits today', value: money(kpis.depositsToday) },
    {
      label: 'Balances outstanding',
      value: money(kpis.balancesOutstanding),
      ...(kpis.balancesOutstanding > 0
        ? { delta: 'Chase these', direction: 'down' }
        : { delta: 'All settled', direction: 'up' }),
    },
    { label: 'Bookings · 7 days', value: kpis.bookingsWeek },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-[18px]">
      {CARDS.map((c) => (
        <KpiCard key={c.label} {...c} />
      ))}
    </div>
  );
}
