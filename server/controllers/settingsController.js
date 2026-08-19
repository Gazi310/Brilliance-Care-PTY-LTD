import asyncHandler from '../utils/asyncHandler.js';
import Settings from '../models/Settings.js';
import {
  clampBookingWindowDays,
  DEFAULT_BOOKING_WINDOW_DAYS,
  MIN_BOOKING_WINDOW_DAYS,
  MAX_BOOKING_WINDOW_DAYS,
} from '../utils/delivery.js';

const DEFAULT_FEE = 9.99;
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Get the singleton settings document, creating it with defaults on first use.
 *
 * Done as an upsert rather than find-then-create: on a cold database the very
 * first two requests can both find nothing and both try to insert, and the
 * second would fail on the unique `key` index. `$setOnInsert` means the
 * defaults are only applied when the document is genuinely new, so this never
 * overwrites a fee the admin has since changed.
 */
export async function getSettingsDoc() {
  return Settings.findOneAndUpdate(
    { key: 'global' },
    { $setOnInsert: { key: 'global', deliveryFee: DEFAULT_FEE } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

// Convenience helper used by the order controller.
export async function getDeliveryFee() {
  const doc = await getSettingsDoc();
  return doc.deliveryFee;
}

// Convenience helper used by the booking controller.
export async function getDepositPercent() {
  const doc = await getSettingsDoc();
  return typeof doc.depositPercent === 'number' ? doc.depositPercent : 50;
}

/**
 * How far ahead customers may book, in days (today counts as day one).
 * Read by the delivery controller for the scopes that use a booking window.
 */
export async function getBookingWindowDays() {
  const doc = await getSettingsDoc();
  return clampBookingWindowDays(doc.bookingWindowDays ?? DEFAULT_BOOKING_WINDOW_DAYS);
}

/**
 * GST component INCLUDED in a GST-inclusive total (at 10%: total / 11).
 * Returns 0 when GST is switched off in settings.
 */
export async function getGstAmount(total) {
  const doc = await getSettingsDoc();
  if (doc.gstEnabled === false) return 0;
  const rate = typeof doc.gstRate === 'number' && doc.gstRate > 0 ? doc.gstRate : 0.1;
  return round2((Number(total) * rate) / (1 + rate));
}

const publicShape = (doc) => ({
  deliveryFee: doc.deliveryFee,
  depositPercent: doc.depositPercent ?? 50,
  gstEnabled: doc.gstEnabled !== false,
  gstRate: doc.gstRate ?? 0.1,
  currency: doc.currency || 'AUD',
  bookingWindowDays: clampBookingWindowDays(doc.bookingWindowDays ?? DEFAULT_BOOKING_WINDOW_DAYS),
  businessName: doc.businessName || 'Brilliance Care PTY LTD',
  abn: doc.abn || '',
  businessPhone: doc.businessPhone || '',
  businessEmail: doc.businessEmail || '',
  businessAddress: doc.businessAddress || '',
  businessHours: doc.businessHours || '',
  servicePostcodes: doc.servicePostcodes || [],
});

// GET /api/settings  (public) — the bits the storefront needs.
export const getSettings = asyncHandler(async (req, res) => {
  const doc = await getSettingsDoc();
  res.json(publicShape(doc));
});

// Business text fields: name in the DB → { maxLen, label } for validation.
const TEXT_FIELDS = {
  businessName: { maxLen: 120, label: 'Business name' },
  abn: { maxLen: 20, label: 'ABN' },
  businessPhone: { maxLen: 30, label: 'Phone' },
  businessEmail: { maxLen: 120, label: 'Email' },
  businessAddress: { maxLen: 160, label: 'Address' },
  businessHours: { maxLen: 120, label: 'Opening hours' },
};

// PUT /api/settings  (admin) — update the storefront knobs.
export const updateSettings = asyncHandler(async (req, res) => {
  const doc = await getSettingsDoc();

  if (req.body.deliveryFee !== undefined) {
    const fee = Number(req.body.deliveryFee);
    if (!Number.isFinite(fee) || fee < 0) {
      res.status(400);
      throw new Error('Delivery fee must be a non-negative number');
    }
    doc.deliveryFee = round2(fee);
  }
  if (req.body.depositPercent !== undefined) {
    const pct = Number(req.body.depositPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      res.status(400);
      throw new Error('Deposit percent must be between 0 and 100');
    }
    doc.depositPercent = round2(pct);
  }
  if (req.body.gstEnabled !== undefined) {
    doc.gstEnabled = Boolean(req.body.gstEnabled);
  }
  if (req.body.bookingWindowDays !== undefined) {
    const win = Number(req.body.bookingWindowDays);
    if (!Number.isInteger(win) || win < MIN_BOOKING_WINDOW_DAYS || win > MAX_BOOKING_WINDOW_DAYS) {
      res.status(400);
      throw new Error(
        `Booking window must be a whole number of days between ${MIN_BOOKING_WINDOW_DAYS} and ${MAX_BOOKING_WINDOW_DAYS}`
      );
    }
    doc.bookingWindowDays = win;
  }

  for (const [field, rule] of Object.entries(TEXT_FIELDS)) {
    if (req.body[field] === undefined) continue;
    const value = String(req.body[field]).trim();
    if (value.length > rule.maxLen) {
      res.status(400);
      throw new Error(`${rule.label} must be ${rule.maxLen} characters or fewer`);
    }
    doc[field] = value;
  }

  if (req.body.servicePostcodes !== undefined) {
    const raw = req.body.servicePostcodes;
    // Accept an array or a comma/space separated string; keep valid 4-digit codes.
    const parts = Array.isArray(raw) ? raw : String(raw).split(/[\s,;]+/);
    const codes = parts.map((p) => String(p).trim()).filter(Boolean);
    const bad = codes.find((c) => !/^\d{4}$/.test(c));
    if (bad !== undefined) {
      res.status(400);
      throw new Error(`"${bad}" is not a valid 4-digit postcode`);
    }
    doc.servicePostcodes = [...new Set(codes)].sort();
  }

  await doc.save();
  res.json(publicShape(doc));
});
