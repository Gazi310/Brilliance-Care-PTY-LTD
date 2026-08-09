import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Accordion, { AccordionItem } from '../ui/Accordion.jsx';

/**
 * "What if something changes?" — the edge cases, bottom of /how-it-works.
 *
 * Every one of these is a commitment, not a policy summary, and they're
 * the questions that decide whether someone books today or "has a think
 * about it". The first one is open by default because it's the fear the
 * whole deposit model creates: that the final bill is open-ended.
 *
 * These five overlap with /faq on purpose — someone reading this page
 * shouldn't have to leave it to find out what happens if the job grows.
 */

const CASES = [
  {
    q: 'The job turns out bigger than estimated',
    a: 'We contact you before doing the extra work. Nothing above your estimate gets charged without you agreeing to it first — no exceptions.',
    open: true,
  },
  {
    q: 'The job turns out smaller',
    a: 'Your invoice drops automatically. If the final total lands below the deposit you’ve already paid, we refund the difference to your original payment method within three business days.',
  },
  {
    q: 'I need to reschedule',
    a: 'Change your slot free of charge up to 12 hours before pickup, from your orders page or by calling us. Inside 12 hours we’ll do our best, but the team may already be routed.',
  },
  {
    q: 'I need to cancel',
    a: 'Cancel more than 24 hours out and the deposit is refunded in full. Inside 24 hours we retain half the deposit to cover the held slot.',
  },
  {
    q: 'Something comes back wrong',
    a: 'Tell us within 48 hours for laundry, or 72 hours for cleaning. We re-do it at no charge, and if it can’t be fixed we repair, replace or refund.',
  },
];

export default function ChangesFaq() {
  return (
    <Band tone="white" question="What if something changes?">
      <Container width="narrow">
        <h2 className="bc-h2 mb-7 text-center lg:mb-10">What if something changes?</h2>

        <Accordion>
          {CASES.map(({ q, a, open }) => (
            <AccordionItem key={q} q={q} defaultOpen={open}>
              <p className="bc-body">{a}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Band>
  );
}
