import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Button from '../ui/Button.jsx';

/**
 * The closing CTA every marketing page ends on.
 *
 * Five pages were going to carry a near-identical navy band with one
 * heading, one line and one gold button, so it lives here once. The
 * homepage keeps its own `home/ClosingCta` — that one is deeper, pulls
 * the phone number from settings, and is tuned to the end of a ten
 * section narrative rather than a short inner page.
 *
 * `tone="sky"` is for pages that already end on navy content (the
 * pricing worked example does), where a second navy band in a row
 * would read as one very long band.
 */
export default function CtaBand({
  title,
  sub,
  cta = 'Get my estimate',
  to = '/book',
  tone = 'navy',
  question,
}) {
  const onNavy = tone === 'navy';

  return (
    <Band tone={tone} size="sm" question={question}>
      <Container width="prose" className="space-y-[18px] text-center">
        <h2 className="bc-h2">{title}</h2>
        {sub && <p className={`bc-lead ${onNavy ? 'text-sky-100' : 'text-muted'}`}>{sub}</p>}
        <div>
          <Button to={to} variant="gold" pill className="w-full lg:w-auto">
            {cta}
          </Button>
        </div>
      </Container>
    </Band>
  );
}
