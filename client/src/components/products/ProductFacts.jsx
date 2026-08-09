import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Accordion, { AccordionItem } from '../ui/Accordion.jsx';

/**
 * ProductFacts — the collapsible detail band under the buy box.
 *
 * The wireframe's three panels were "How to use it", "Ingredients" and
 * "Delivery & returns". The first two are per-product copy the Product
 * model doesn't carry, and inventing directions-of-use for a cleaning
 * chemical is not a thing to guess at. So this ships the questions we
 * can actually answer — all three are policy, identical for every
 * product, and all three are things customers ask before ordering.
 *
 * When the model grows `usage` / `ingredients` fields, add them above
 * these as extra <AccordionItem>s and nothing else has to move.
 */
export default function ProductFacts({ fee }) {
  const amount = typeof fee === 'number' ? `$${fee.toFixed(2)}` : 'a flat fee';

  return (
    <Band tone="sky" size="sm">
      <Container width="narrow">
        <Accordion>
          <AccordionItem q="Delivery & returns" defaultOpen>
            <p className="bc-body">
              Orders placed before 2pm on a business day are packed the same day and
              delivered across our service area within two to three days. There's no slot
              to choose — we deliver at the earliest suitable time and message you on the
              way. Unopened items can be returned within 30 days for a full refund.
            </p>
          </AccordionItem>

          <AccordionItem q="Adding this to a booking">
            <p className="bc-body">
              If you've got a laundry or cleaning job booked, add the products to that
              order instead and they arrive with your team — no delivery fee at all. A
              shop-only order carries {amount} to cover the trip.
            </p>
          </AccordionItem>

          <AccordionItem q="Payment">
            <p className="bc-body">
              Shop orders are paid in full at checkout. The 50% deposit model applies to
              laundry and cleaning bookings, where the final price depends on what we
              find when we assess the job — a box of detergent has no such surprises, so
              there's nothing to split.
            </p>
          </AccordionItem>
        </Accordion>
      </Container>
    </Band>
  );
}
