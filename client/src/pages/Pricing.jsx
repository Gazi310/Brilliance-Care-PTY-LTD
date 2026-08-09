import PageHero from '../components/ui/PageHero.jsx';
import PricingExplainer from '../components/marketing/PricingExplainer.jsx';
import PricingTables from '../components/marketing/PricingTables.jsx';
import WorkedExample from '../components/marketing/WorkedExample.jsx';
import CtaBand from '../components/marketing/CtaBand.jsx';

/**
 * /pricing — every published price, generated from the live catalogue.
 *
 * Order matters here: how the money works, then the numbers, then a
 * worked example. A price list read before the deposit is explained
 * looks like a quote, and the deposit then looks like a second charge.
 *
 * The closing CTA is sky rather than navy — the worked example above it
 * is already a navy band, and two in a row read as one very long one.
 */
export default function Pricing() {
  return (
    <main>
      <PageHero
        title="Every price, in one place"
        sub="No quotes over the phone, no hidden call-out fees. What you see here is what feeds your estimate."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Pricing' },
        ]}
      />

      <PricingExplainer />
      <PricingTables />
      <WorkedExample />

      <CtaBand
        tone="sky"
        title="See your own number"
        sub="The estimator uses exactly the prices on this page."
      />
    </main>
  );
}
