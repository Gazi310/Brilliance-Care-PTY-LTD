import Hero from '../home/Hero';
import WhoWeAre from '../home/WhoWeAre';
import ProofStats from '../home/ProofStats';
import WhyUs from '../home/WhyUs';
import ServicesSection from '../home/ServicesSection';
import HowItWorks from '../home/HowItWorks';
import Reviews from '../home/Reviews';
import ServiceArea from '../home/ServiceArea';
import FaqTeaser from '../home/FaqTeaser';
import ClosingCta from '../home/ClosingCta';

/**
 * The homepage. Routed from `/` — note that `pages/Home.jsx` is not
 * where this lives and never was.
 *
 * Ten sections in the order the client approved, and the order is the
 * deliverable: v1 put three service tiles directly under the hero, so
 * the page started selling before it had said who anyone was. Here
 * nothing is for sale until section 5.
 *
 *   1  Hero              white   What is this?
 *   2  WhoWeAre          sky     Who am I dealing with?
 *   3  ProofStats        white   Are these people legit?
 *   4  WhyUs             white   Why you and not someone cheaper?
 *   5  ServicesSection   sand    What can I buy?
 *   6  HowItWorks        navy    What happens after I click?
 *   7  Reviews           white   Do real people like it?
 *   8  ServiceArea       sky     Do you come to me?
 *   9  FaqTeaser         white   What about my edge case?
 *  10  ClosingCta        navy    Ready?
 *
 * Sections 3 and 4 share one white band — the stat strip straddles the
 * seam with the sky band above it, which is why it has no padding of
 * its own. Band tone sequence: white · sky · white · sand · navy ·
 * white · sky · white · navy.
 *
 * This file stays a list of imports. Every section owns its own Band,
 * so there's no page-level wrapper, no max-width and no padding here —
 * the bands are full-bleed by design.
 */
export default function Main() {
  return (
    <main>
      <Hero />
      <WhoWeAre />
      <ProofStats />
      <WhyUs />
      <ServicesSection />
      <HowItWorks />
      <Reviews />
      <ServiceArea />
      <FaqTeaser />
      <ClosingCta />
    </main>
  );
}
