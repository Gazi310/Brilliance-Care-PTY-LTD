import asyncHandler from '../utils/asyncHandler.js';
import DeliverySlot from '../models/DeliverySlot.js';
import {
  DELIVERY_WINDOWS,
  WINDOW_KEYS,
  getWindowDef,
  dayFromToday,
  dayMeta,
  isValidYMD,
  normalizeScope,
  DEFAULT_SCOPE,
} from '../utils/delivery.js';

const MAX_DAYS = 60;

/**
 * GET /api/delivery-slots?days=14&scope=shop
 * Public. Returns a rolling window of upcoming days for one scope (shop /
 * laundry / cleaning — defaults to shop). Every day exposes the three windows;
 * each is "occupied" unless an admin opened it (available=true).
 */
export const getSlots = asyncHandler(async (req, res) => {
  const days = Math.min(MAX_DAYS, Math.max(1, Number(req.query.days) || 14));
  const scope = normalizeScope(req.query.scope);

  // Build the date range and fetch any stored slots (for this scope) inside it.
  const meta = Array.from({ length: days }, (_, i) => dayMeta(dayFromToday(i)));
  const dates = meta.map((m) => m.date);
  const records = await DeliverySlot.find({ scope, date: { $in: dates } });

  // Index stored records by `${date}|${window}` for quick lookup.
  const byKey = new Map(records.map((r) => [`${r.date}|${r.window}`, r]));

  const daysOut = meta.map((m, i) => {
    const slots = DELIVERY_WINDOWS.map((w) => {
      const rec = byKey.get(`${m.date}|${w.key}`);
      return {
        window: w.key,
        label: w.label,
        time: w.time,
        available: rec ? rec.available : false, // occupied by default
        note: rec?.note || '',
      };
    });
    return {
      ...m,
      isToday: i === 0,
      slots,
      availableCount: slots.filter((s) => s.available).length,
    };
  });

  res.json({ scope, today: meta[0].date, windows: DELIVERY_WINDOWS, days: daysOut });
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
 */
export async function resolveOpenSlot(res, deliverySlot, scope = DEFAULT_SCOPE) {
  const { date, window } = deliverySlot || {};
  if (!isValidYMD(date) || !WINDOW_KEYS.includes(window)) {
    res.status(400);
    throw new Error('Please choose a valid delivery slot');
  }
  const rec = await DeliverySlot.findOne({ scope: normalizeScope(scope), date, window });
  if (!rec || !rec.available) {
    res.status(409);
    throw new Error('That delivery slot is no longer available — please pick another');
  }
  const def = getWindowDef(window);
  return { date, window, label: def.label, time: def.time };
}
