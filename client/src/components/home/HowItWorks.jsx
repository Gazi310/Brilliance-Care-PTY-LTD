import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import StepCard from '../ui/StepCard.jsx';
import Button from '../ui/Button.jsx';

/**
 * Section 6 — "What happens after I click?"
 *
 * The first navy band on the page, and the first gold CTA. Both are
 * spent here rather than in the hero because this is where the visitor
 * has enough information to act.
 *
 * Steps 2 and 4 exist to defuse the deposit. The estimate → deposit →
 * assess → balance model is genuinely unusual, and left unexplained it
 * reads as "they'll charge me twice". Spelled out as four steps it
 * reads as "they won't overcharge me", which is what it actually is.
 *
 * `/how-it-works` (Phase 3) is the long version of this section.
 */

const STEPS = [
  {
    step: 'STEP 1',
    title: 'Get your estimate',
    body: 'Tell us what you need and when. You’ll see a price estimate straight away.',
  },
  {
    step: 'STEP 2',
    title: 'Pay a 50% deposit',
    body: 'Lock the booking in with half up front. The rest waits until the job’s done.',
  },
  {
    step: 'STEP 3',
    title: 'We pick up and get to work',
    body: 'We collect at your chosen time, weigh and assess the real job, then do it properly.',
  },
  {
    step: 'STEP 4',
    title: 'Final invoice, then delivery',
    body: 'You’re invoiced for the actual amount, minus your deposit, and we bring everything back.',
  },
];

export default function HowItWorks() {
  return (
    <Band tone="navy" question="What happens after I click?">
      <Container>
        <SectionHead eyebrow="How it works" title="Booking takes about two minutes" />

        <div className="grid gap-4 lg:grid-cols-4 lg:gap-6">
          {STEPS.map(({ step, title, body }) => (
            <StepCard key={step} step={step} title={title}>
              {body}
            </StepCard>
          ))}
        </div>

        <div className="mt-8 text-center lg:mt-[52px]">
          <Button to="/book" variant="gold" pill className="w-full lg:w-auto">
            Get my estimate
          </Button>
          <p className="bc-meta mt-4 text-sky-100">No card needed to see your price.</p>
        </div>
      </Container>
    </Band>
  );
}
