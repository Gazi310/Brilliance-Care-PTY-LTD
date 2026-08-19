import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { createBooking } from '../../services/bookingService.js';
import ToastStack from '../products/ToastStack.jsx';
import { Button, IconBadge, Notice, Stepper } from '../ui';
import {
  AlertIcon,
  ArrowRightIcon,
  BasketIcon,
  BubblesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from './icons.jsx';
import StepBuildLaundry from './StepBuildLaundry.jsx';
import StepBuildCleaning from './StepBuildCleaning.jsx';
import StepSchedule, { returnAfterPickup } from './StepSchedule.jsx';
import StepDetails from './StepDetails.jsx';
import StepReview from './StepReview.jsx';

const STEP_LABEL = {
  1: 'What needs cleaning?',
  2: 'Pickup & delivery',
  3: 'Where & how',
  4: 'Confirm & deposit',
};

/** Short labels for the <Stepper> — the long ones above caption it below. */
const STEP_NAMES = ['Build', 'Schedule', 'Details', 'Review'];

/**
 * The guided 4-step booking flow (blueprint §4.5): Build → Schedule →
 * Details → Review. Works for laundry, cleaning, or both (combo). The
 * draft lives in BookingContext so refreshes and the login round-trip
 * keep the customer's work.
 */
export default function BookingFlow({ service }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    draft,
    laundryServices,
    cleaningServices,
    catalogueLoading,
    catalogueError,
    setLaundryQty,
    setCleaningService,
    setCleaningField,
    setAddonQty,
    setPickupSlot,
    setReturnSlot,
    setCleaningSlot,
    setDetails,
    reset,
    lines,
    hasLaundry,
    hasCleaning,
    estimatedTotal,
    gstAmount,
    depositPercent,
    depositAmount,
    balancePreview,
    slotsReady,
    detailsReady,
    toPayload,
  } = useBooking();

  const [step, setStep] = useState(() => {
    const s = Number(searchParams.get('step'));
    return s >= 1 && s <= 4 ? s : 1;
  });
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };

  const otherService = service === 'laundry' ? 'cleaning' : 'laundry';
  // If the draft already includes the other service, keep its builder visible.
  const otherActive = otherService === 'cleaning' ? hasCleaning : hasLaundry;
  const showOtherPanel = showOther || otherActive;

  const scheduleOk = slotsReady && (!hasLaundry || returnAfterPickup(draft.pickupSlot, draft.returnSlot));

  // How far the draft actually allows the customer to be.
  const maxStep = useMemo(() => {
    if (lines.length === 0) return 1;
    if (!scheduleOk) return 2;
    if (!detailsReady) return 3;
    return 4;
  }, [lines.length, scheduleOk, detailsReady]);

  // Clamp deep links / stale ?step once the catalogue has loaded.
  useEffect(() => {
    if (!catalogueLoading && step > maxStep) setStep(maxStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogueLoading, maxStep]);

  // Keep ?step= in the URL so a login round-trip resumes where they left off.
  useEffect(() => {
    const cur = Number(searchParams.get('step')) || 1;
    if (cur !== step) setSearchParams({ step: String(step) }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const goTo = (s) => {
    setStep(Math.max(1, Math.min(4, s)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---- primary CTA ---- */
  const canContinue =
    step === 1 ? lines.length > 0 :
    step === 2 ? scheduleOk :
    step === 3 ? detailsReady :
    terms && !submitting;

  const ctaLabel =
    step === 1 ? 'Next: schedule' :
    step === 2 ? 'Next: your details' :
    step === 3 ? 'Review order' :
    !user ? 'Sign in to continue' :
    `Continue to deposit · $${depositAmount.toFixed(2)}`;

  const handleContinue = async () => {
    if (step < 4) {
      goTo(step + 1);
      return;
    }
    // Step 4 — hand over to the deposit checkout.
    if (!user) {
      navigate('/login', {
        state: { from: { pathname: location.pathname, search: '?step=4' } },
      });
      return;
    }
    setSubmitting(true);
    try {
      const order = await createBooking(toPayload());
      reset();
      navigate(`/checkout/${order._id}`, { state: { order } });
    } catch (err) {
      notify(err.message, 'error');
      setSubmitting(false);
    }
  };

  const backTarget = service === 'cleaning' ? '/cleaning' : '/laundry';

  /* ================================================================ */
  return (
    <main className="min-h-screen bg-sky-50 pb-40 lg:pb-24">
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        {/* ---- App bar: back + title ---- */}
        <div className="mb-4 flex items-center gap-2">
          {step === 1 ? (
            <Link
              to={backTarget}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-navy-900"
            >
              <ChevronLeftIcon width={16} height={16} aria-hidden="true" /> Back
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-navy-900"
            >
              <ChevronLeftIcon width={16} height={16} aria-hidden="true" /> Back
            </button>
          )}
          <h1 className="bc-h4 mx-auto pr-10">
            {service === 'cleaning' ? 'Book a clean' : 'Book a pickup'}
          </h1>
        </div>

        {/* ---- Progress ---- */}
        <p className="bc-meta mb-2 px-0.5 text-muted">
          Step {step} of 4 · {STEP_LABEL[step]}
        </p>
        <Stepper steps={STEP_NAMES} current={step - 1} />

        {/* ---- Estimate explainer (step 1 only) ---- */}
        {step === 1 && (
          <Notice tone="info" className="mb-5">
            You'll see an <b className="font-bold">estimated total</b>. Pay a{' '}
            <b className="font-bold">{depositPercent}% deposit</b> to book — we invoice the balance
            after your service.
          </Notice>
        )}

        {/* ---- Step body ---- */}
        <div>
          {catalogueError ? (
            <div className="flex gap-3.5 rounded-card bg-bad-bg px-5 py-[18px] text-[15.5px] leading-[1.55] text-bad">
              <AlertIcon className="mt-0.5 flex-none" aria-hidden="true" />
              <p>{catalogueError} — please refresh to try again.</p>
            </div>
          ) : catalogueLoading ? (
            <div className="space-y-3">
              <div className="bc-skeleton h-40 rounded-card" />
              <div className="bc-skeleton h-24 rounded-card" />
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  {service === 'laundry' ? (
                    <StepBuildLaundry
                      services={laundryServices}
                      laundryQty={draft.laundryQty}
                      setLaundryQty={setLaundryQty}
                    />
                  ) : (
                    <StepBuildCleaning
                      services={cleaningServices}
                      cleaning={draft.cleaning}
                      setCleaningService={setCleaningService}
                      setCleaningField={setCleaningField}
                      setAddonQty={setAddonQty}
                    />
                  )}

                  {/* Cross-sell: add the other service in the same booking */}
                  {!showOtherPanel ? (
                    <button
                      type="button"
                      onClick={() => setShowOther(true)}
                      className="flex w-full items-center gap-4 rounded-card border border-line bg-white p-5 text-left shadow-card transition hover:bg-sky-50"
                    >
                      <IconBadge
                        size="inline"
                        tone={otherService === 'cleaning' ? 'navy' : 'sky'}
                        icon={otherService === 'cleaning' ? BubblesIcon : BasketIcon}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="bc-h4 block">
                          {otherService === 'cleaning' ? 'Add a home clean?' : 'Add laundry too?'}
                        </span>
                        <span className="block text-[13px] text-muted">
                          {otherService === 'cleaning'
                            ? 'Book a cleaner in the same visit'
                            : 'We can collect a load while we’re there'}
                        </span>
                      </span>
                      <ChevronRightIcon width={18} height={18} className="flex-none text-navy-500" aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <p className="bc-eyebrow">
                          {otherService === 'cleaning' ? 'Add a home clean' : 'Add laundry'}
                        </p>
                        {!otherActive && (
                          <button
                            type="button"
                            onClick={() => setShowOther(false)}
                            className="text-xs font-semibold text-muted underline-offset-2 hover:underline"
                          >
                            Hide
                          </button>
                        )}
                      </div>
                      {otherService === 'cleaning' ? (
                        <StepBuildCleaning
                          services={cleaningServices}
                          cleaning={draft.cleaning}
                          setCleaningService={setCleaningService}
                          setCleaningField={setCleaningField}
                          setAddonQty={setAddonQty}
                        />
                      ) : (
                        <StepBuildLaundry
                          services={laundryServices}
                          laundryQty={draft.laundryQty}
                          setLaundryQty={setLaundryQty}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <StepSchedule
                  hasLaundry={hasLaundry}
                  hasCleaning={hasCleaning}
                  pickupSlot={draft.pickupSlot}
                  setPickupSlot={setPickupSlot}
                  returnSlot={draft.returnSlot}
                  setReturnSlot={setReturnSlot}
                  cleaningSlot={draft.cleaningSlot}
                  setCleaningSlot={setCleaningSlot}
                />
              )}

              {step === 3 && <StepDetails details={draft.details} setDetails={setDetails} />}

              {step === 4 && (
                <StepReview
                  lines={lines}
                  estimatedTotal={estimatedTotal}
                  gstAmount={gstAmount}
                  depositPercent={depositPercent}
                  depositAmount={depositAmount}
                  balancePreview={balancePreview}
                  hasLaundry={hasLaundry}
                  hasCleaning={hasCleaning}
                  pickupSlot={draft.pickupSlot}
                  returnSlot={draft.returnSlot}
                  cleaningSlot={draft.cleaningSlot}
                  details={draft.details}
                  goTo={goTo}
                  terms={terms}
                  setTerms={setTerms}
                  signedIn={!!user}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ---- Sticky estimate + primary CTA (clears the mobile tab bar) ---- */}
      {!catalogueLoading && !catalogueError && (
        <div className="fixed inset-x-0 bottom-20 z-40 px-4 lg:bottom-6">
          <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-card border border-line bg-white/95 p-3 shadow-lift backdrop-blur sm:p-4">
            <div className="min-w-0">
              <span className="bc-eyebrow block">Estimated</span>
              <span className="block font-display text-xl font-bold tabular-nums text-navy-900 sm:text-2xl">
                ${estimatedTotal.toFixed(2)}
              </span>
              {estimatedTotal > 0 && (
                <span className="block text-xs text-muted">
                  ~${depositAmount.toFixed(2)} deposit now
                </span>
              )}
            </div>
            <Button
              variant="gold"
              size="sm"
              onClick={handleContinue}
              disabled={!canContinue}
              className="ml-auto flex-none"
            >
              {submitting ? 'Creating booking…' : ctaLabel}
              {!submitting && <ArrowRightIcon width={16} height={16} aria-hidden="true" />}
            </Button>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </main>
  );
}
