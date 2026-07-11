import mongoose from 'mongoose';
import { WINDOW_KEYS, DELIVERY_SCOPES, DEFAULT_SCOPE } from '../utils/delivery.js';

/**
 * One bookable window on one calendar day, for one service line (`scope`).
 * Slots are "occupied by default": a scope/day/window is only bookable when an
 * admin has created a record here with available=true. No record === occupied.
 * Each scope (shop / laundry / cleaning) has its own independent calendar.
 */
const deliverySlotSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, enum: DELIVERY_SCOPES, default: DEFAULT_SCOPE },
    date: { type: String, required: true }, // 'YYYY-MM-DD' (local)
    window: { type: String, required: true, enum: WINDOW_KEYS },
    available: { type: Boolean, default: true }, // true = open for booking
    note: { type: String, default: '' }, // optional admin note (e.g. "Holiday")
  },
  { timestamps: true }
);

// One record per (scope, date, window).
deliverySlotSchema.index({ scope: 1, date: 1, window: 1 }, { unique: true });

const DeliverySlot = mongoose.model('DeliverySlot', deliverySlotSchema);
export default DeliverySlot;
