import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import StepCard from '../ui/StepCard.jsx';
import { useSettings } from '../../hooks/useSettings';

/**
 * "What happens after I click?" — the short version, top of /how-it-works.
 *
 * The homepage makes the same four points; this page repeats them
 * because a visitor who clicked "how it works" from the nav has usually
 * skipped the homepage entirely. Each step here carries the detail the
 * homepage version leaves out — slot lengths, what happens with no
 * account, when the card is actually charged.
 */
export default function HowItWorksSteps() {
  const deposit = useSettings()?.depositPercent ?? 50;

  return (
    <Band tone="white" question="What happens after I click?">
      <Container>
        <SectionHead eyebrow="The short version" title="Four steps, about two minutes" />

        <div className="grid gap-4 lg:grid-cols-4 lg:gap-6">
          <StepCard tone="tint" step="STEP 1" title="Build your estimate">
            Choose services and quantities. The price updates as you go — no card and no sign-up
            needed to see it.
          </StepCard>
          <StepCard tone="tint" step="STEP 2" title="Pick your slots">
            Two-hour pickup and delivery windows, seven days a week. Laundry and cleaning have
            their own calendars.
          </StepCard>
          <StepCard tone="tint" step="STEP 3" title={`Pay a ${deposit}% deposit`}>
            {deposit === 50 ? 'Half the estimate holds' : 'That holds'} the booking. You get a
            confirmation with your order number straight away.
          </StepCard>
          <StepCard tone="tint" step="STEP 4" title="We do the job, then invoice">
            We assess the real work, send a final invoice with your deposit credited, and you
            settle the balance on delivery.
          </StepCard>
        </div>
      </Container>
    </Band>
  );
}
