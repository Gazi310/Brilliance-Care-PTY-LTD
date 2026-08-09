import PageHero from '../components/ui/PageHero.jsx';
import ServiceLines from '../components/marketing/ServiceLines.jsx';
import ServiceComparison from '../components/marketing/ServiceComparison.jsx';
import PromisesBand from '../components/marketing/PromisesBand.jsx';
import CtaBand from '../components/marketing/CtaBand.jsx';

/**
 * /services — the overview page for all three service lines.
 *
 * Was a 12-line "Coming soon" stub. The page answers three questions in
 * order: what can I buy, which one is right for me, and why you. Nothing
 * here is a booking form — every path out of this page goes to a service
 * page or to the estimator.
 */
export default function Services() {
  return (
    <main>
      <PageHero
        title="Everything we do"
        sub="Two service lines and a small shop. All of it collected from, and returned to, your front door."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services' },
        ]}
      />

      <ServiceLines />
      <ServiceComparison />
      <PromisesBand />

      <CtaBand
        title="Still deciding?"
        sub="Start an estimate — you can change everything before you pay a cent."
      />
    </main>
  );
}
