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
            icon="🧺"
            title="Laundry pickup"
            hint="When should we collect?"
            accent="sky"
            scope="laundry"
            value={pickupSlot}
            onChange={setPickupSlot}
            defaultOpen={!pickupSlot}
          />
          <SlotField
            icon="✨"
            title="Laundry return"
            hint="When should we bring it back?"
            accent="amber"
            scope="laundry"
            value={returnSlot}
            onChange={setReturnSlot}
          />
          {returnTooEarly && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              ⚠️ The return window must be after the pickup — most loads take about 48h.
            </p>
          )}
        </>
      )}

      {hasCleaning && (
        <SlotField
          icon="🫧"
          title="Cleaning appointment"
          hint="When should we come to clean?"
          accent="emerald"
          scope="cleaning"
          value={cleaningSlot}
          onChange={setCleaningSlot}
          defaultOpen={!hasLaundry && !cleaningSlot}
        />
      )}

      {hasLaundry && hasCleaning && (
        <p className="px-1 text-[11px] leading-relaxed text-faint">
          Tip: pick the <span className="font-semibold text-muted">same day &amp; window</span> for the
          cleaning and a laundry visit and our team makes a single trip.
        </p>
      )}
    </div>
  );
}
