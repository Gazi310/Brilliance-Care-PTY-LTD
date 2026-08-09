import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import StatStrip from '../ui/StatStrip.jsx';

/**
 * Section 3 — "Are these people legit?"
 *
 * Named ProofStats rather than StatStrip so it doesn't collide with the
 * `ui/StatStrip` primitive it renders: this file is the homepage band,
 * that one is the panel.
 *
 * The band carries no padding at all. StatStrip's negative top margin
 * pulls the navy panel up so it straddles the seam between the sky band
 * above and the white band below — which is why it reads as proof
 * attached to the introduction rather than a separate section.
 *
 * Figures are the client's. If they move, they move here and in the
 * footer, not in three places.
 */

const STATS = [
  { value: '4.9 ★', label: 'Average customer rating' },
  { value: '2,000+', label: 'Happy customers' },
  { value: '30+', label: 'Suburbs serviced' },
  { value: '100%', label: 'Insured & police-checked' },
];

export default function ProofStats() {
  return (
    <Band tone="white" size="none" question="Are these people legit?">
      <Container>
        <StatStrip stats={STATS} />
      </Container>
    </Band>
  );
}
