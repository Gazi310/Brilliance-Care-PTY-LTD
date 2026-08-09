import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';

/**
 * Section 2 — "Who am I dealing with?"
 *
 * This band is the whole redesign in one section. v1 opened with three
 * service tiles, so the first thing a visitor met was a price list. The
 * client's objection was that it read like a marketplace rather than a
 * family business, so nothing is for sale until section 5 and the page
 * introduces the people first.
 *
 * Kept short on purpose. It's an introduction, not an About page —
 * the detail lives on /services and /how-it-works.
 */
export default function WhoWeAre() {
  return (
    <Band tone="sky" question="Who am I dealing with?">
      <Container width="narrow" className="space-y-[18px] text-center">
        <p className="bc-eyebrow">Who we are</p>
        <h2 className="bc-h2">Welcome to Brilliance Care.</h2>

        <p className="bc-lead">
          We&rsquo;re a family-run laundry and cleaning service based in Melbourne, looking after
          homes right across the eastern suburbs. We started Brilliance Care in 2023 and brought
          more than six years in the trade with us &mdash; and we still treat every basket, and
          every home, like it&rsquo;s our own.
        </p>

        <p className="bc-body text-muted">
          No call centres. No rotating contractors. Just a small team that turns up when we say we
          will.
        </p>

        <p className="bc-meta font-semibold text-navy-500">&mdash; The Brilliance Care family</p>
      </Container>
    </Band>
  );
}
