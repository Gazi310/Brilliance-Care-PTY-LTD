import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import StepCard from '../ui/StepCard.jsx';
import Notice from '../ui/Notice.jsx';
import { useSettings } from '../../hooks/useSettings';
import { money } from '../../utils/money';

/**
 * "How does the money actually work?" — the top of /pricing.
 *
 * Three steps before a single price, because the estimate → deposit →
 * invoice model is the thing that makes every number below it make
 * sense. Read in the other order, the price list looks like a quote and
 * the deposit looks like a surprise.
 *
 * Deposit percent and the delivery fee both come from /admin/settings,
 * so a business decision made in one place doesn't have to be
 * remembered in two.
 */
export default function PricingExplainer() {
  const settings = useSettings();
  const deposit = settings?.depositPercent ?? 50;
  const gstOn = settings?.gstEnabled !== false;
  const fee = settings?.deliveryFee;

  return (
    <Band tone="white" size="sm" question="How does the money actually work?">
      <Container>
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <StepCard tone="tint" step="STEP 1" title="You see an estimate">
            Built from the prices below. It updates live as you add services.
          </StepCard>
          <StepCard tone="tint" step="STEP 2" title={`You pay ${deposit}%`}>
            A deposit holds your slot. Nothing else is charged yet.
          </StepCard>
          <StepCard tone="tint" step="STEP 3" title="We invoice the real job">
            After we weigh and assess. Lighter load, smaller invoice.
          </StepCard>
        </div>

        <Notice tone="info" className="mt-7">
          <strong>
            All prices are in Australian dollars{gstOn ? ' and include GST' : ''}.
          </strong>{' '}
          Pickup and delivery is free on laundry and cleaning. Shop-only orders carry a flat
          delivery fee{fee != null ? ` of ${money(fee)}` : ''}, shown at checkout.
        </Notice>
      </Container>
    </Band>
  );
}
