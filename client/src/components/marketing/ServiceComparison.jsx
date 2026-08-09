import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import PriceTable from '../ui/PriceTable.jsx';
import { useCatalogue, byName } from '../../hooks/useCatalogue';
import { priceFrom } from '../../utils/money';

/**
 * "Not sure which you need?" — the decision table on /services.
 *
 * The left column is the only genuinely editorial content on this page:
 * it's written from the customer's side of the problem ("just want the
 * washing gone every week") rather than ours ("Wash & Fold, per load").
 * Matching those two up is the entire job of this table.
 *
 * So the rows are curated here, but the *price* on each row is looked up
 * live by service name. If an admin renames a service the lookup misses
 * and the row falls back to its last known price rather than showing
 * nothing — a marketing page with blank prices is worse than one that's
 * a fortnight stale, and the rename is visible in /admin either way.
 */

const ROWS = [
  {
    need: 'Just want the washing gone every week',
    service: 'Wash & Fold',
    line: 'laundry',
    note: 'Laundry · 48-hour turnaround',
    fallback: 24.99,
  },
  {
    need: 'Need shirts pressed for work',
    service: 'Ironing & Pressing',
    line: 'laundry',
    note: 'Laundry · returned on hangers',
    fallback: 3.5,
  },
  {
    need: 'Want the house kept on top of',
    service: 'Standard Home Clean',
    line: 'cleaning',
    note: 'Cleaning · weekly or fortnightly',
    fallback: 89,
  },
  {
    need: 'Are having people over and it’s been a while',
    service: 'Deep Cleaning',
    line: 'cleaning',
    note: 'Cleaning · one-off',
    fallback: 169,
  },
  {
    need: 'Are moving out and need the bond back',
    service: 'End of Lease / Bond Clean',
    line: 'cleaning',
    note: 'Cleaning · agent standard',
    fallback: 299,
  },
  {
    need: 'Run a café, salon or short-stay property',
    service: 'Office & Commercial',
    line: 'cleaning',
    note: 'Contact us for a volume rate',
    fallback: 129,
  },
];

const COLUMNS = [
  { key: 'need', label: 'If you…' },
  { key: 'book', label: 'Book' },
  { key: 'from', label: 'From', align: 'right' },
];

export default function ServiceComparison() {
  const { laundry, cleaning, loading } = useCatalogue();

  const rows = ROWS.map((r) => {
    const live = byName(r.line === 'laundry' ? laundry : cleaning, r.service);
    return {
      id: r.service,
      need: r.need,
      book: { value: <strong>{live?.name || r.service}</strong>, note: r.note },
      from: loading ? (
        <span className="bc-skeleton inline-block h-4 w-14 rounded align-middle" />
      ) : (
        priceFrom(live?.price ?? r.fallback)
      ),
    };
  });

  return (
    <Band tone="sand" question="Which one is right for me?">
      <Container>
        <SectionHead eyebrow="Compare" title="Not sure which you need?" />
        <PriceTable
          columns={COLUMNS}
          rows={rows}
          caption="Which Brilliance Care service suits which situation, and the starting price of each"
        />
      </Container>
    </Band>
  );
}
