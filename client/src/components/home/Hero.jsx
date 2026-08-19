import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import ImagePlaceholder from '../ui/ImagePlaceholder.jsx';
import PostcodeCheck from './PostcodeCheck.jsx';
import { CheckIcon } from './icons';
import heroPhoto from '../../assets/laundry-handover-doorstep.webp';

/**
 * Section 1 — the hero. "What is this?"
 *
 * v2 turns the full-bleed navy gradient panel into a white split: copy
 * on the left, a photograph on the right. That's deliberate. The band
 * below it is sky and the one below that is white, so an all-navy hero
 * would put the page's two darkest surfaces at the top and leave the
 * rest of the narrative looking like an afterthought. Navy is spent on
 * the two bands that ask for action instead.
 *
 * The H1 is mixed-weight: light first line, bold second. `.lt` in the
 * type scale handles the weight and the line break, so the markup is
 * one heading rather than two stacked elements.
 */

const TICKS = ['Free pickup & delivery', 'Fully insured', 'Seven days a week'];

export default function Hero() {
  return (
    // Slightly less top padding than the standard rhythm: the header's
    // logo disc notches down over this band and needs room to land.
    <Band tone="white" size="none" className="pb-16 pt-14 lg:pb-28 lg:pt-24" question="What is this?">
      <Container className="flex flex-col gap-9 lg:flex-row lg:items-center lg:gap-16">
        <div className="min-w-0 flex-1 space-y-[18px]">
          <p className="bc-eyebrow">Melbourne&rsquo;s eastern suburbs</p>

          <h1 className="bc-h1">
            <span className="lt">Fresh laundry and a spotless home,</span>
            without lifting a finger.
          </h1>

          <p className="bc-lead text-muted">
            Family-run pickup-and-delivery laundry, plus home and end-of-lease cleaning, right
            across Melbourne&rsquo;s eastern suburbs. Free pickup and delivery, a price up front,
            and no surprises on the invoice.
          </p>

          <PostcodeCheck id="hero-postcode" />

          <ul className="flex list-none flex-wrap gap-x-[22px] gap-y-2.5 p-0 text-muted">
            {TICKS.map((t) => (
              <li key={t} className="inline-flex items-center gap-[7px] text-sm font-medium">
                <CheckIcon className="h-4 w-4 flex-none text-navy-500" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 flex-1">
          {/* `priority` because this is the LCP element on the site's most
              visited page — it must not be lazy-loaded. */}
          <ImagePlaceholder
            src={heroPhoto}
            priority
            ratio="7/6"
            alt="A Brilliance Care team member handing a bag of freshly folded laundry back to a customer at their front door"
          />
        </div>
      </Container>
    </Band>
  );
}
