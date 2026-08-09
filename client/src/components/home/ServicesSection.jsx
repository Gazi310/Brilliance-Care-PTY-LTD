import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import ServiceCard from './ServiceCard.jsx';

/**
 * Section 5 — "What can I buy?"
 *
 * Replaces v1's `TabsSection`, which sat directly under the hero. This
 * is the single most important change in the redesign: nothing is sold
 * above this point. The visitor has met the business, seen the numbers
 * and read why people stay before anyone mentions a price.
 *
 * Sand band — the only warm surface on the page. It separates the
 * commercial section from the white editorial bands either side of it
 * without spending navy, which is reserved for the two CTAs.
 *
 * Three cards scroll horizontally on mobile rather than stacking:
 * stacked, the third card is 1,800px down the page and effectively
 * doesn't exist.
 */

const SERVICES = [
  {
    to: '/laundry',
    photo: 'Folded laundry stack, warm light',
    name: 'Laundry',
    body: 'Wash, dry, fold and ironing, collected from your door and back within 48 hours. Priced by the load or by the item — whichever suits you.',
    price: 'from $24.99',
    priceNote: 'a load',
  },
  {
    to: '/cleaning',
    photo: 'Cleaner at work in a bright living room',
    name: 'Cleaning',
    body: 'Regular home cleans, deep cleans and end-of-lease bond cleans. Priced on the size of your home, not a guess over the phone.',
    price: 'from $89',
    priceNote: 'a visit',
  },
  {
    to: '/products',
    photo: 'Eco detergent bottles on a shelf',
    name: 'Shop',
    body: 'Eco detergents, wool dryer balls and laundry essentials, delivered with your next order.',
    price: 'Browse',
    priceNote: 'the shop',
  },
];

export default function ServicesSection() {
  return (
    <Band tone="sand" question="What can I buy?">
      <Container>
        <SectionHead eyebrow="Our services" title="What we can take off your hands" />

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0 lg:pb-0">
          {SERVICES.map((s) => (
            <div key={s.to} className="w-[290px] flex-none snap-start lg:w-auto">
              <ServiceCard {...s} />
            </div>
          ))}
        </div>
      </Container>
    </Band>
  );
}
