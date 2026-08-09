import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import PromiseGrid from '../marketing/PromiseGrid.jsx';
import { TruckIcon, LeafIcon, ShieldIcon, ReceiptIcon } from './icons';

/**
 * Section 4 — "Why you and not someone cheaper?"
 *
 * Shares the white band with the stat strip above, so the top padding
 * is set here rather than taken from the standard rhythm: the strip
 * has already used the seam.
 *
 * Every icon is a real SVG in an IconBadge. v1 used 🧺 🫧 📍 and the
 * client named emoji as one of the things that made the site look
 * unfinished — they also render differently on every platform and
 * can't be recoloured.
 *
 * The last card does the heaviest lifting: the deposit model is the
 * commercial differentiator, and "we invoice after we weigh it" is the
 * sentence that makes it sound generous instead of complicated.
 */

const REASONS = [
  {
    icon: TruckIcon,
    title: 'Free pickup & delivery',
    body: 'We collect from your door and bring everything back folded, on a day that suits you. No delivery fee on laundry and cleaning bookings.',
  },
  {
    icon: LeafIcon,
    title: 'Eco-friendly products',
    body: 'Gentle, low-tox detergents and cleaning products that are safe around kids, pets and sensitive skin.',
  },
  {
    icon: ShieldIcon,
    title: 'Insured & police-checked',
    body: 'Every member of our team is fully insured and police-checked before they set foot in your home.',
  },
  {
    icon: ReceiptIcon,
    title: 'No-surprise invoicing',
    body: 'You get an estimate up front and pay a 50% deposit. We only invoice the balance once we’ve weighed and assessed the real job — so you never overpay.',
  },
];

export default function WhyUs() {
  return (
    <Band
      tone="white"
      size="none"
      className="pb-16 pt-14 lg:pb-28 lg:pt-24"
      question="Why you and not someone cheaper?"
    >
      <Container>
        <SectionHead eyebrow="Why Brilliance Care" title="Why people stay with us" />

        <PromiseGrid items={REASONS} />
      </Container>
    </Band>
  );
}
