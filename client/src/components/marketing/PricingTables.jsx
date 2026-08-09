import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import PriceTable from '../ui/PriceTable.jsx';
import Notice from '../ui/Notice.jsx';
import { useCatalogue, bookable, homeCleans, flatCleans } from '../../hooks/useCatalogue';
import { money, plusMoney } from '../../utils/money';

/**
 * The published price list — /pricing, sections 2 and 3.
 *
 * Every row is generated from the same records the estimator prices
 * against, so this page and the booking flow can't disagree. That's the
 * one thing a public price list has to get right: a customer who sees
 * $24.99 here and $27.50 at checkout doesn't file a bug, they leave.
 *
 * Unavailable services are filtered out. An admin switching something
 * off is saying "don't sell this right now", and a price list is
 * selling.
 *
 * The cleaning table is two tables because cleaning has two pricing
 * models: home-size services (base + per room) and flat per-visit ones.
 * Forcing both into one grid gives every add-on three empty columns.
 */

const SKELETON_ROWS = 5;

const loadingRows = (columns) =>
  Array.from({ length: SKELETON_ROWS }, (_, i) => {
    const row = { id: `sk-${i}` };
    for (const c of columns) {
      row[c.key] = <span className="bc-skeleton inline-block h-4 w-24 rounded align-middle" />;
    }
    return row;
  });

const LAUNDRY_COLUMNS = [
  { key: 'service', label: 'Service' },
  { key: 'charged', label: 'Charged' },
  { key: 'price', label: 'Price', align: 'right' },
];

const HOME_COLUMNS = [
  { key: 'service', label: 'Service' },
  { key: 'base', label: 'Base (1 bed / 1 bath)' },
  { key: 'bedroom', label: 'Extra bedroom' },
  { key: 'bathroom', label: 'Extra bathroom', align: 'right' },
];

const FLAT_COLUMNS = [
  { key: 'service', label: 'Service' },
  { key: 'charged', label: 'Charged' },
  { key: 'price', label: 'Price', align: 'right' },
];

/** Shown only when the catalogue can't be reached at all. */
function Unavailable({ line }) {
  return (
    <Notice tone="warn">
      We couldn’t load the live {line} prices just now. Refresh the page, or start an estimate —
      the estimator prices from the same list and is unaffected.
    </Notice>
  );
}

export default function PricingTables() {
  const { laundry, cleaning, loading, error } = useCatalogue();

  const laundryRows = bookable(laundry).map((s) => ({
    id: s._id,
    service: { value: <strong>{s.name}</strong>, note: s.turnaround ? `${s.turnaround} turnaround` : '' },
    charged: s.unit || 'per item',
    price: money(s.price),
  }));

  const homeRows = homeCleans(cleaning).map((s) => ({
    id: s._id,
    service: { value: <strong>{s.name}</strong>, note: s.duration ? `about ${s.duration} on site` : '' },
    base: money(s.price),
    bedroom: plusMoney(s.perBedroom),
    bathroom: plusMoney(s.perBathroom),
  }));

  const flatRows = flatCleans(cleaning).map((s) => ({
    id: s._id,
    service: {
      value: <strong>{s.name}</strong>,
      note: s.isAddon ? 'Added to any clean' : s.description || '',
    },
    charged: s.unit || 'per visit',
    price: money(s.price),
  }));

  return (
    <>
      <Band tone="sand" question="What does laundry cost?">
        <Container>
          <SectionHead eyebrow="Laundry" title="Priced by the load or the item" />
          {error && laundryRows.length === 0 ? (
            <Unavailable line="laundry" />
          ) : (
            <PriceTable
              columns={LAUNDRY_COLUMNS}
              rows={loading ? loadingRows(LAUNDRY_COLUMNS) : laundryRows}
              caption="Laundry services and prices"
            />
          )}
        </Container>
      </Band>

      <Band tone="white" question="What does cleaning cost?">
        <Container>
          <SectionHead
            eyebrow="Cleaning"
            title="Priced on the size of your home"
            sub="The base price covers one bedroom and one bathroom. Add the per-room amounts for anything beyond that."
          />

          {error && homeRows.length === 0 ? (
            <Unavailable line="cleaning" />
          ) : (
            <>
              <PriceTable
                columns={HOME_COLUMNS}
                rows={loading ? loadingRows(HOME_COLUMNS) : homeRows}
                caption="Cleaning services priced by home size"
              />

              {(loading || flatRows.length > 0) && (
                <>
                  <h3 className="bc-h3 mb-[18px] mt-10">Add-ons and commercial</h3>
                  <PriceTable
                    columns={FLAT_COLUMNS}
                    rows={loading ? loadingRows(FLAT_COLUMNS) : flatRows}
                    caption="Cleaning add-ons and commercial rates"
                  />
                </>
              )}
            </>
          )}
        </Container>
      </Band>
    </>
  );
}
