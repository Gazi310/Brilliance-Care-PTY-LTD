import asyncHandler from '../utils/asyncHandler.js';
import Settings from '../models/Settings.js';

const DEFAULT_FEE = 9.99;
const round2 = (n) => Math.round(n * 100) / 100;

// Get the singleton settings document, creating it with defaults on first use.
export async function getSettingsDoc() {
  let doc = await Settings.findOne({ key: 'global' });
  if (!doc) doc = await Settings.create({ key: 'global', deliveryFee: DEFAULT_FEE });
  return doc;
}

// Convenience helper used by the order controller.
export async function getDeliveryFee() {
  const doc = await getSettingsDoc();
  return doc.deliveryFee;
}

// Convenience helper used by the booking controller.
export async function getDepositPercent() {
  const doc = await getSettingsDoc();
  return typeof doc.depositPercent === 'number' ? doc.depositPercent : 30;
}

const publicShape = (doc) => ({
  deliveryFee: doc.deliveryFee,
  depositPercent: doc.depositPercent ?? 30,
  gstRate: doc.gstRate ?? 0.1,
  currency: doc.currency || 'AUD',
});

// GET /api/settings  (public) — the bits the storefront needs.
export const getSettings = asyncHandler(async (req, res) => {
  const doc = await getSettingsDoc();
  res.json(publicShape(doc));
});

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
  await doc.save();
  res.json(publicShape(doc));
});
