import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Chip from '../ui/Chip.jsx';
import ImagePlaceholder from '../ui/ImagePlaceholder.jsx';
import PostcodeCheck from './PostcodeCheck.jsx';

/**
 * Section 8 — "Do you come to me?"
 *
 * The second postcode check. Repeating it isn't redundancy: the one in
 * the hero catches people who arrive already interested, this one
 * catches everyone who read the whole page first, and by now they've
 * seen the pricing and are asking a different question.
 *
 * The suburb list is deliberately named rather than generated from the
 * admin postcode list — "Box Hill" answers the question, "3128" makes
 * people go and look it up. The postcode field is what's authoritative;
 * these are recognition, not a specification.
 */

const SUBURBS = [
  'Box Hill',
  'Camberwell',
  'Doncaster',
  'Ringwood',
  'Glen Waverley',
  'Blackburn',
  'Balwyn',
  'Mount Waverley',
  'Kew',
  'Nunawading',
  'Vermont',
  'Burwood',
];

export default function ServiceArea() {
  return (
    <Band tone="sky" question="Do you come to me?">
      <Container className="flex flex-col gap-9 lg:flex-row lg:gap-16">
        <div className="min-w-0 flex-1 space-y-[18px]">
          <p className="bc-eyebrow">Service area</p>
          <h2 className="bc-h2">We cover Melbourne&rsquo;s eastern suburbs</h2>
          <p className="bc-body text-muted">
            If you&rsquo;re inside the ring on the map, we&rsquo;ll pick up from your door. Not
            sure? Pop your postcode in and we&rsquo;ll tell you straight away.
          </p>

          <PostcodeCheck id="area-postcode" cta="Check" />

          <ul className="flex list-none flex-wrap gap-2 p-0">
            {SUBURBS.map((s) => (
              <li key={s}>
                <Chip as="span">{s}</Chip>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 flex-1">
          <ImagePlaceholder
            ratio="4/3"
            subject="Melbourne east with the service radius highlighted"
          />
        </div>
      </Container>
    </Band>
  );
}
