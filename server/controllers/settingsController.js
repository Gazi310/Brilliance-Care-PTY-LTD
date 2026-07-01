import asyncHandler from '../utils/asyncHandler.js';
import Settings from '../models/Settings.js';

const DEFAULT_FEE = 9.99;

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

// GET /api/settings  (public) — the bits the storefront needs (delivery fee).
export const getSettings = asyncHandler(async (req, res) => {
  const doc = await getSettingsDoc();
  res.json({ deliveryFee: doc.deliveryFee });
});

// PUT /api/settings  (admin) — update the flat delivery fee.
export const updateSettings = asyncHandler(async (req, res) => {
  const doc = await getSettingsDoc();
  if (req.body.deliveryFee !== undefined) {
    const fee = Number(req.body.deliveryFee);
    if (!Number.isFinite(fee) || fee < 0) {
      res.status(400);
      throw new Error('Delivery fee must be a non-negative number');
    }
    doc.deliveryFee = Math.round(fee * 100) / 100;
  }
  await doc.save();
  res.json({ deliveryFee: doc.deliveryFee });
});
