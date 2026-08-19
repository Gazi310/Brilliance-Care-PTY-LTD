import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import Notice from '../ui/Notice.jsx';
import Button from '../ui/Button.jsx';
import LaundryServiceInfo from './LaundryServiceInfo.jsx';
import { BasketIcon } from '../booking/icons.jsx';

const BOOK_TO = '/book/laundry';

function SkeletonCard() {
  return (
    <div className="flex gap-5 rounded-card border border-line bg-white p-5 shadow-card lg:p-6">
      <div className="bc-skeleton h-[124px] w-[124px] flex-none rounded-img" />
      <div className="flex-1 space-y-3">
        <div className="bc-skeleton h-5 w-2/3 rounded" />
        <div className="bc-skeleton h-3 w-full rounded" />
        <div className="bc-skeleton h-3 w-5/6 rounded" />
        <div className="bc-skeleton h-9 w-1/2 rounded" />
      </div>
    </div>
  );
}

/**
 * The /laundry overview: introduces every laundry service with a description
 * and a Book button. Booking (choosing quantities & estimate) happens in the
 * guided flow at /book/laundry.
 *
 * Phase 4 restyle. The page's own gradient hero is gone — the navy
 * `<PageHero>` on the page owns the top of the screen now, the same as
 * every other inner page. What's left is two bands: the catalogue, and
 * the closing CTA that carries the page's single gold button.
 *
 * The deposit model was previously a grey sentence next to the heading.
 * It's the thing customers most often misread, so it's a `<Notice>`
 * above the list rather than a caption beside it.
 *
 * The staggered entrance used to be a `mounted` state flag flipped from
 * an effect, which is the `set-state-in-effect` pattern lint flags across
 * the app. The cards only mount once the list has loaded, so a CSS
 * `bc-fade-up` with a per-card delay does the same job with no state —
 * and it respects `prefers-reduced-motion`, which the old version didn't.
 */
export default function LaundryOverview({ services = [], loading, error, onRetry }) {
  const hasServices = !loading && !error && services.length > 0;

  return (
    <>
      <Band tone="white" question="What can I get washed?">
        <Container>
          <SectionHead
            eyebrow="Our services"
            title="Everything we wash, iron and fold"
            sub="Pick what needs doing — we collect it from your door and bring it back clean."
          />

          <Notice tone="info" className="mx-auto mb-8 max-w-[820px] lg:mb-12">
            Prices are an <b className="font-bold">estimate</b>. We weigh and check your load on
            pickup, so you pay a <b className="font-bold">50% deposit</b> to book and the balance
            once we know the real total — and if it comes in lighter, you pay less.
          </Notice>

          {error ? (
            <Notice tone="warn" className="items-center">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                <span>{error}</span>
                {onRetry && (
                  <Button variant="outline" size="sm" onClick={onRetry}>
                    Retry
                  </Button>
                )}
              </div>
            </Notice>
          ) : loading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-card border border-line bg-sky-50 px-6 py-16 text-center lg:py-20">
              <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold-100 text-navy-500">
                <BasketIcon width={24} height={24} />
              </span>
              <h3 className="bc-h3">No laundry services yet</h3>
              <p className="bc-body mx-auto mt-2 max-w-[420px] text-muted">
                We're still setting up the price list. Check back soon, or book a clean in the
                meantime.
              </p>
              <div className="mt-6">
                <Button variant="outline" to="/cleaning">
                  See cleaning
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              {services.map((s, i) => (
                <LaundryServiceInfo key={s._id} service={s} index={i} bookTo={BOOK_TO} />
              ))}
            </div>
          )}
        </Container>
      </Band>

      {hasServices && (
        <Band tone="navy" size="sm" question="How do I start?">
          <Container className="flex flex-col items-start gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-[560px]">
              <h2 className="bc-h2">Book a pickup</h2>
              <p className="bc-lead mt-3.5 text-sky-100">
                Tell us what you've got and pick a window. It takes about two minutes, and nothing
                is charged until you confirm.
              </p>
            </div>
            <Button variant="gold" size="lg" pill to={BOOK_TO} className="w-full lg:w-auto">
              Get my estimate
            </Button>
          </Container>
        </Band>
      )}
    </>
  );
}
