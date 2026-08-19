import { Notice } from '../ui';
import { BasketIcon, BubblesIcon, SparkleIcon } from './icons.jsx';
import SlotField from './SlotField.jsx';

const WINDOW_ORDER = ['morning', 'afternoon', 'evening'];

/** Is the return slot after the pickup slot? (later day, or later window same-day) */
export const returnAfterPickup = (pickup, ret) => {
  if (!pickup || !ret) return true; // only judge once both are chosen
  return (
    ret.date > pickup.date ||
    (ret.date === pickup.date &&
      WINDOW_ORDER.indexOf(ret.window) > WINDOW_ORDER.indexOf(pickup.window))
  );
};

/**
 * Booking step 2 — choose visit windows on the month-grid calendar
 * (the SlotCalendar system already used across the app, per the client's
 * preference — not the wireframe's date-chip buttons).
 */
export default function StepSchedule({
  hasLaundry,
  hasCleaning,
  pickupSlot,
  setPickupSlot,
  returnSlot,
  setReturnSlot,
  cleaningSlot,
  setCleaningSlot,
}) {
  const returnTooEarly = hasLaundry && !returnAfterPickup(pickupSlot, returnSlot);

  return (
    <div className="space-y-3">
      {hasLaundry && (
        <>
          <SlotField
            icon={BasketIcon}
            title="Laundry pickup"
            hint="When should we collect?"
            accent="pickup"
            scope="laundry"
            value={pickupSlot}
            onChange={setPickupSlot}
            defaultOpen={!pickupSlot}
          />
          <SlotField
            icon={SparkleIcon}
            title="Laundry return"
            hint="When should we bring it back?"
            accent="return"
            scope="laundry"
            value={returnSlot}
            onChange={setReturnSlot}
          />
          {returnTooEarly && (
            <Notice tone="warn">
              The return window must be after the pickup — most loads take about 48h.
            </Notice>
          )}
        </>
      )}

      {hasCleaning && (
        <SlotField
          icon={BubblesIcon}
          title="Cleaning appointment"
          hint="When should we come to clean?"
          accent="cleaning"
          scope="cleaning"
          value={cleaningSlot}
          onChange={setCleaningSlot}
          defaultOpen={!hasLaundry && !cleaningSlot}
        />
      )}

      {hasLaundry && hasCleaning && (
        <p className="px-1 text-[13px] leading-relaxed text-muted">
          Tip: pick the <span className="font-semibold text-navy-900">same day &amp; window</span> for the
          cleaning and a laundry visit and our team makes a single trip.
        </p>
      )}
    </div>
  );
}
