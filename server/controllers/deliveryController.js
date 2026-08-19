import asyncHandler from '../utils/asyncHandler.js';
import DeliverySlot from '../models/DeliverySlot.js';
import { getBookingWindowDays } from './settingsController.js';
import {
  DELIVERY_WINDOWS,
  WINDOW_KEYS,
  getWindowDef,
  dayFromToday,
  dayMeta,
  isValidYMD,
  normalizeScope,
  DEFAULT_SCOPE,
  scopeUsesHorizon,
  horizonEndDate,
  isWithinHorizon,
  slotStatus,
} from '../utils/delivery.js';

const MAX_DAYS = 60;

/**
 * GET /api/delivery-slots?days=14&scope=shop
 * Public. Returns a rolling window of upcoming days for one scope (shop /
 * laundry / cleaning — defaults to shop). Every day exposes the three windows;
 * each is "occupied" unless an admin opened it (available=true).
 *
 * On a horizon scope (laundry) each day and window also carries a three-way
 * `status`: 'available' (open, inside the booking window), 'booked' (inside
 * the window but nothing open) or 'unavailable' (past the window — we aren't
 * taking that day yet). Scopes without a horizon only ever report available /
 * unavailable, which is exactly the old two-state behaviour.
 *
 * `available` is left untouched on every payload: it still means "an admin
 * opened this", which is what the admin editor toggles against. Beyond the
 * horizon an admin CAN pre-open days — they simply go live to customers as
 * the rolling window reaches them.
 */
export const getSlots = asyncHandler(async (req, res) => {
  const days = Math.min(MAX_DAYS, Math.max(1, Number(req.query.days) || 14));
  const scope = normalizeScope(req.query.scope);
  const usesHorizon = scopeUsesHorizon(scope);
  const windowDays = usesHorizon ? await getBookingWindowDays() : days;
  const horizonEnd = usesHorizon ? horizonEndDate(windowDays) : null;

  // Build the date range and fetch any stored slots (for this scope) inside it.
  const meta = Array.from({ length: days }, (_, i) => dayMeta(dayFromToday(i)));
  const dates = meta.map((m) => m.date);
  const records = await DeliverySlot.find({ scope, date: { $in: dates } });

  // Index stored records by `${date}|${window}` for quick lookup.
  const byKey = new Map(records.map((r) => [`${r.date}|${r.window}`, r]));

  const daysOut = meta.map((m, i) => {
    const bookable = !usesHorizon || isWithinHorizon(m.date, windowDays);
    const slots = DELIVERY_WINDOWS.map((w) => {
      const rec = byKey.get(`${m.date}|${w.key}`);
      const open = rec ? rec.available : false; // occupied by default
      return {
        window: w.key,
        label: w.label,
        time: w.time,
        available: open,
        status: slotStatus({ date: m.date, open, scope, windowDays }),
        note: rec?.note || '',
      };
    });
    const availableCount = slots.filter((s) => s.available).length;
    return {
      ...m,
      isToday: i === 0,
      slots,
      availableCount,
      // A day is bookable when it's inside the window AND something is open.
      status: slotStatus({ date: m.date, open: availableCount > 0, scope, windowDays }),
      // True for days an admin may prepare but customers can't see yet.
      beyondWindow: !bookable,
    };
  });

  res.json({
    scope,
    today: meta[0].date,
    windows: DELIVERY_WINDOWS,
    usesBookingWindow: usesHorizon,
    bookingWindowDays: usesHorizon ? windowDays : null,
    bookingWindowEnd: horizonEnd,
    days: daysOut,
  });
});

/**
 * PUT /api/delivery-slots  (admin)
 * Body: { date, window, available, note?, scope? } — open or close a single
 * window on one scope's calendar (defaults to shop).
 */
export const setSlot = asyncHandler(async (req, res) => {
  const { date, window, available, note } = req.body;
  const scope = normalizeScope(req.body.scope);

  if (!isValidYMD(date)) {
    res.status(400);
    throw new Error('A valid date (YYYY-MM-DD) is required');
  }
  if (!WINDOW_KEYS.includes(window)) {
    res.status(400);
    throw new Error(`window must be one of: ${WINDOW_KEYS.join(', ')}`);
  }

  const slot = await DeliverySlot.findOneAndUpdate(
    { scope, date, window },
    { $set: { available: Boolean(available), note: note ?? '' } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json(slot);
});

/**
 * PUT /api/delivery-slots/day  (admin)
 * Body: { date, available, scope? } — open or close all three windows for a day
 * at once, on one scope's calendar (defaults to shop).
 */
export const setDay = asyncHandler(async (req, res) => {
  const { date, available } = req.body;
  const scope = normalizeScope(req.body.scope);
  if (!isValidYMD(date)) {
    res.status(400);
    throw new Error('A valid date (YYYY-MM-DD) is required');
  }

  await Promise.all(
    WINDOW_KEYS.map((window) =>
      DeliverySlot.findOneAndUpdate(
        { scope, date, window },
        { $set: { available: Boolean(available) } },
        { upsert: true, setDefaultsOnInsert: true }
      )
    )
  );

  const slots = await DeliverySlot.find({ scope, date });
  res.json(slots);
});

/**
 * Used by the order/booking controllers: confirms a chosen { date, window } is
 * currently open on the given scope's calendar, and returns a snapshot to store
 * on the order. Throws (res.status set) on an invalid or occupied slot.
 *
 * The booking-window check matters here and not only in the UI: an admin can
 * pre-open days past the horizon so they go live automatically, and without
 * this a hand-rolled request could book one of them early.
 */
export async function resolveOpenSlot(res, deliverySlot, scope = DEFAULT_SCOPE) {
  const { date, window } = deliverySlot || {};
  const normalized = normalizeScope(scope);
  if (!isValidYMD(date) || !WINDOW_KEYS.includes(window)) {
    res.status(400);
    throw new Error('Please choose a valid delivery slot');
  }
  if (scopeUsesHorizon(normalized)) {
    const windowDays = await getBookingWindowDays();
    if (!isWithinHorizon(date, windowDays)) {
      res.status(409);
      throw new Error(
        `We're only taking bookings up to ${windowDays} days ahead — please pick an earlier date`
      );
    }
  }
  const rec = await DeliverySlot.findOne({ scope: normalized, date, window });
  if (!rec || !rec.available) {
    res.status(409);
    throw new Error('That delivery slot is no longer available — please pick another');
  }
  const def = getWindowDef(window);
  return { date, window, label: def.label, time: def.time };
}
