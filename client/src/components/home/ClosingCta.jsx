import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Button from '../ui/Button.jsx';
import { useSettings } from '../../hooks/useSettings';

/**
 * Section 10 — "Ready?"
 *
 * Deeper than the standard rhythm (140px against 112px) so the page
 * ends on air rather than running straight into the footer, which is
 * also navy.
 *
 * The phone number is the escape hatch. A meaningful share of this
 * customer base would rather talk to someone than fill in a booking
 * form, and losing them at the last section because there was no
 * number is an expensive way to keep the design tidy. It comes from
 * /admin/settings — until the client supplies one, the line is
 * dropped rather than showing a placeholder.
 */
export default function ClosingCta() {
  const settings = useSettings();
  const phone = settings?.businessPhone || '';
  const hours = settings?.businessHours || '7am to 7pm, seven days';

  return (
    <Band
      tone="navy"
      size="none"
      className="py-20 lg:py-[140px]"
      question="Ready?"
    >
      <Container width="prose" className="space-y-[18px] text-center">
        <h2 className="bc-h2">Ready for your last laundry day?</h2>

        <p className="bc-lead text-sky-100">
          Get a price in under two minutes. Free pickup and delivery right across the eastern
          suburbs.
        </p>

        <div>
          <Button to="/book" variant="gold" pill className="w-full lg:w-auto">
            Get my estimate
          </Button>
        </div>

        {phone && (
          <p className="bc-meta text-sky-100">
            Or call us on{' '}
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="font-semibold text-white underline underline-offset-4"
            >
              {phone}
            </a>
            , {hours}.
          </p>
        )}
      </Container>
    </Band>
  );
}
