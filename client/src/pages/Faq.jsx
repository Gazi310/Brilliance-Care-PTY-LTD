import PageHero from '../components/ui/PageHero.jsx';
import FaqGroups from '../components/marketing/FaqGroups.jsx';
import CtaBand from '../components/marketing/CtaBand.jsx';

/**
 * /faq — the long list. The homepage teaser holds five questions; this
 * is the other twenty, grouped so the page can be scanned rather than
 * read start to finish.
 *
 * The closing CTA points at /contact rather than /book: anyone still
 * reading at the bottom of the FAQ has a question the page didn't
 * answer, and pushing them into the estimator ignores that.
 */
export default function Faq() {
  return (
    <main>
      <PageHero
        title="Frequently asked questions"
        sub="Booking, pricing, turnaround, insurance and the awkward edge cases."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'FAQ' },
        ]}
      />

      <FaqGroups />

      <CtaBand
        title="Didn’t find it?"
        sub="Send us a message and a person will come back to you within one business day."
        cta="Contact us"
        to="/contact"
      />
    </main>
  );
}
