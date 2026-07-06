import mongoose from 'mongoose';

/**
 * Global store settings — a single document keyed by `key: 'global'`.
 * Holds the flat delivery fee charged per home visit (see orderController for
 * how visits are de-duplicated so a shared slot is only billed once), plus the
 * deposit/GST knobs that drive the estimate → deposit → invoice model.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    deliveryFee: { type: Number, default: 9.99, min: 0 },
    depositPercent: { type: Number, default: 50, min: 0, max: 100 }, // % of estimate paid to book
    gstRate: { type: Number, default: 0.1, min: 0 }, // AU GST — prices are shown GST-inclusive
    currency: { type: String, default: 'AUD' },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
