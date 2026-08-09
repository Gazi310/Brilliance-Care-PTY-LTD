import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import PromiseGrid from './PromiseGrid.jsx';
import { TruckIcon, LeafIcon, ShieldIcon, ReceiptIcon } from '../home/icons';

/**
 * "The same four promises on every job" — /services, section 3.
 *
 * The homepage makes the same four points at length, in the middle of a
 * narrative. Here they're compressed to a line each, because by this
 * point on this page the visitor has already chosen a service and is
 * looking for a reason not to close the tab.
 */

const PROMISES = [
  {
    icon: TruckIcon,
    title: 'Free pickup & delivery',
    body: 'On every laundry and cleaning booking, across the whole service area.',
  },
  {
    icon: LeafIcon,
    title: 'Eco-friendly products',
    body: 'Low-tox and fragrance-free as standard, safe around kids and pets.',
  },
  {
    icon: ShieldIcon,
    title: 'Insured & police-checked',
    body: 'Every team member, before their first job. Certificates on request.',
  },
  {
    icon: ReceiptIcon,
    title: 'No-surprise invoicing',
    body: 'A 50% deposit, then the balance only after the real job is assessed.',
  },
];

export default function PromisesBand() {
  return (
    <Band tone="white" question="Why you and not someone cheaper?">
      <Container>
        <SectionHead eyebrow="Why Brilliance Care" title="The same four promises on every job" />
        <PromiseGrid items={PROMISES} />
      </Container>
    </Band>
  );
}
