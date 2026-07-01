import mongoose from 'mongoose';

/**
 * Global store settings — a single document keyed by `key: 'global'`.
 * Holds the flat delivery fee charged per home visit (see orderController for
 * how visits are de-duplicated so a shared slot is only billed once).
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    deliveryFee: { type: Number, default: 9.99, min: 0 },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
