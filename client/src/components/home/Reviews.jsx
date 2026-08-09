import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import { StarIcon } from './icons';

/**
 * Section 7 — "Do real people like it?"
 *
 * Four reviews, each one answering a different objection rather than
 * four variations of "great service": turnaround, the bond clean,
 * getting the same team back, and — the one that matters most — the
 * invoice coming in under the estimate. That last quote is the deposit
 * model told by a customer instead of by us, which is worth more than
 * the explanation in section 4.
 *
 * v1's reviews were from Parramatta and Chatswood. Those are Sydney
 * suburbs; the business is in Melbourne's east.
 */

const REVIEWS = [
  {
    quote:
      'They picked up Tuesday and everything was back Thursday, folded better than I’d ever manage. I haven’t done a wash in four months.',
    who: 'Priya M. · Box Hill',
  },
  {
    quote:
      'Booked an end-of-lease clean two days before handover and got the full bond back. The agent actually commented on it.',
    who: 'Daniel R. · Ringwood',
  },
  {
    quote:
      'Same two people every fortnight, which matters to me. They know where things go now.',
    who: 'Helen T. · Camberwell',
  },
  {
    quote:
      'The estimate was $140 and the final invoice came to $128, because the load was lighter than we thought. First time a service has charged me less than quoted.',
    who: 'Marcus O. · Glen Waverley',
  },
];

function Stars() {
  return (
    <div className="flex gap-[3px]" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} width={18} height={18} className="text-gold-500" />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <Band tone="white" question="Do real people like it?">
      <Container>
        <SectionHead eyebrow="Reviews" title="2,000 customers, 4.9 stars" />

        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
          {REVIEWS.map((r) => (
            <figure
              key={r.who}
              className="m-0 flex w-[290px] flex-none snap-start flex-col gap-4 rounded-card border border-line bg-white p-6 lg:w-auto lg:p-7"
            >
              <Stars />
              <blockquote className="m-0 text-[16.5px] leading-[1.6]">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto text-sm font-semibold text-navy-500">
                {r.who}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Band>
  );
}
