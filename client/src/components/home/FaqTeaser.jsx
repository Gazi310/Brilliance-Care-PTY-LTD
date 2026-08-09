import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Accordion, { AccordionItem } from '../ui/Accordion.jsx';
import Button from '../ui/Button.jsx';

/**
 * Section 9 — "What about my edge case?"
 *
 * Five questions, not fifteen. This band exists to catch the last
 * objection before the closing CTA, so anything that isn't blocking a
 * booking belongs on /faq (Phase 3) instead.
 *
 * The deposit question is open by default — it's the one thing on this
 * page a first-time visitor is most likely to have got wrong, and it
 * shouldn't need a click.
 */

const FAQS = [
  {
    q: 'How does the deposit work?',
    a: 'You pay 50% when you book, based on your estimate. Once we’ve collected and assessed the real job we send a final invoice for the balance — which is often less than the estimate. You settle that on delivery.',
    open: true,
  },
  {
    q: 'How long does laundry take?',
    a: 'Standard turnaround is 48 hours from pickup. Express 24-hour wash is available if you need it sooner.',
  },
  {
    q: 'Which suburbs do you cover?',
    a: 'More than 30 suburbs across Melbourne’s east. Check your postcode above for an instant answer.',
  },
  {
    q: 'Are your products safe for sensitive skin?',
    a: 'Yes. We use low-tox, fragrance-free detergents as standard, and you can flag allergies on your booking.',
  },
  {
    q: 'Can I book a regular fortnightly clean?',
    a: 'You can. Recurring bookings keep the same team where possible, and you’re charged per visit rather than up front.',
  },
];

export default function FaqTeaser() {
  return (
    <Band tone="white" question="What about my edge case?">
      <Container width="narrow">
        <h2 className="bc-h2 mb-7 text-center lg:mb-11">Questions we get a lot</h2>

        <Accordion>
          {FAQS.map(({ q, a, open }) => (
            <AccordionItem key={q} q={q} defaultOpen={open}>
              <p className="bc-body">{a}</p>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 text-center">
          <Button to="/faq" variant="ghost">
            See all FAQs &rarr;
          </Button>
        </div>
      </Container>
    </Band>
  );
}
