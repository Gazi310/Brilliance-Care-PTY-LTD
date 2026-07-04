import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { createBooking } from '../../services/bookingService.js';
import ToastStack from '../products/ToastStack.jsx';
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
    <main className="min-h-screen bg-surface pb-40 lg:pb-24">
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        {/* ---- App bar: back + title ---- */}
        <div className="mb-3 flex items-center gap-2">
          {step === 1 ? (
            <Link
              to={backTarget}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-navy"
            >
              <span className="text-base leading-none">‹</span> Back
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-navy"
            >
              <span className="text-base leading-none">‹</span> Back
            </button>
          )}
          <h1 className="mx-auto pr-10 text-base font-extrabold text-ink">
            {service === 'cleaning' ? 'Book a clean' : 'Book a pickup'}
          </h1>
        </div>

        {/* ---- Progress ---- */}
        <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-gradient-to-r from-navy to-aqua' : 'bg-line'
              }`}
            />
          ))}
        </div>
        <p className="mt-1.5 px-0.5 text-xs font-semibold text-muted">
          Step {step} of 4 · {STEP_LABEL[step]}
        </p>

        {/* ---- Estimate explainer (step 1 only) ---- */}
        {step === 1 && (
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-800">
            <span aria-hidden="true" className="text-base">💡</span>
            <p>
              You'll see an <b className="font-bold text-amber-900">estimated total</b>. Pay a{' '}
              <b className="font-bold text-amber-900">{depositPercent}% deposit</b> to book — we invoice the
              balance after your service.
            </p>
          </div>
        )}

        {/* ---- Step body ---- */}
        <div className="mt-4">
          {catalogueError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              ⚠️ {catalogueError} — please refresh to try again.
            </div>
          ) : catalogueLoading ? (
            <div className="space-y-3">
              <div className="bc-skeleton h-40 rounded-2xl" />
              <div className="bc-skeleton h-24 rounded-2xl" />
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
                      className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-soft transition hover:bg-surface/60"
                    >
                      <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-mint/25 text-2xl">
                        {otherService === 'cleaning' ? '🫧' : '🧺'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink">
                          {otherService === 'cleaning' ? 'Add a home clean?' : 'Add laundry too?'}
                        </span>
                        <span className="block text-xs text-muted">
                          {otherService === 'cleaning'
                            ? 'Book a cleaner in the same visit'
                            : 'We can collect a load while we’re there'}
                        </span>
                      </span>
                      <span className="text-lg text-faint">›</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">
                          {otherService === 'cleaning' ? 'Add a home clean' : 'Add laundry'}
                        </p>
                        {!otherActive && (
                          <button
                            type="button"
                            onClick={() => setShowOther(false)}
                            className="text-[11px] font-semibold text-faint underline-offset-2 hover:underline"
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
          <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-cta backdrop-blur sm:p-4">
            <div className="min-w-0">
              <span className="block text-[11px] font-extrabold uppercase tracking-wide text-faint">Estimated</span>
              <span className="block text-xl font-extrabold tabular-nums text-ink sm:text-2xl">
                ${estimatedTotal.toFixed(2)}
              </span>
              {estimatedTotal > 0 && (
                <span className="block text-[11px] text-muted">
                  ~${depositAmount.toFixed(2)} deposit now
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="ml-auto inline-flex flex-none items-center gap-2 rounded-xl bg-gradient-to-r from-navy to-aqua px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:px-6"
            >
              {submitting ? 'Creating booking…' : ctaLabel}
              {!submitting && <span className="text-base leading-none">→</span>}
            </button>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </main>
  );
}
