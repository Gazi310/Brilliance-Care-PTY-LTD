import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import ServiceCard from '../home/ServiceCard.jsx';
import { useCatalogue, cheapest, homeCleans } from '../../hooks/useCatalogue';
import { priceFrom } from '../../utils/money';

/**
 * The three service lines, as cards — /services, section 1.
 *
 * Same `ServiceCard` the homepage uses, on purpose: someone arriving
 * here from the top nav should recognise the shape immediately. The
 * copy is longer than the homepage version because this page is the
 * one people land on when they're comparing, not browsing.
 *
 * "From" prices are the cheapest live service in each line rather than
 * a number typed into this file, so they can't drift from what the
 * estimator actually charges. While the catalogue loads the price slot
 * holds a skeleton — a placeholder that turns out to be wrong is worse
 * than a brief grey bar.
 */

const FALLBACK = { laundry: 24.99, cleaning: 89 };

const skeleton = <span className="bc-skeleton inline-block h-[22px] w-[112px] rounded" />;

export default function ServiceLines() {
  const { laundry, cleaning, loading } = useCatalogue();

  const laundryFrom = cheapest(laundry) ?? FALLBACK.laundry;
  const cleaningFrom = cheapest(homeCleans(cleaning)) ?? FALLBACK.cleaning;

  const lines = [
    {
      to: '/laundry',
      photo: 'Folded laundry stack, warm light',
      name: 'Laundry',
      body: 'Wash and fold, ironing, dry cleaning, delicates and bedding. Collected and back within 48 hours, or overnight on express.',
      price: loading ? skeleton : `from ${priceFrom(laundryFrom)}`,
      priceNote: 'a load',
    },
    {
      to: '/cleaning',
      photo: 'Cleaner in a bright living room',
      name: 'Cleaning',
      body: 'Standard, deep and end-of-lease cleans, plus carpet, window and oven add-ons. Priced on the size of your home.',
      price: loading ? skeleton : `from ${priceFrom(cleaningFrom)}`,
      priceNote: 'a visit',
    },
    {
      to: '/products',
      photo: 'Eco detergent bottles on a shelf',
      name: 'Shop',
      body: 'Eco detergents, wool dryer balls and laundry essentials, delivered with your next order or on their own.',
      price: 'Browse',
      priceNote: 'the shop',
    },
  ];

  return (
    <Band tone="white" question="What can I buy?">
      <Container>
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0">
          {lines.map((s) => (
            <div key={s.to} className="w-[290px] flex-none snap-start lg:w-auto">
              <ServiceCard {...s} />
            </div>
          ))}
        </div>
      </Container>
    </Band>
  );
}
