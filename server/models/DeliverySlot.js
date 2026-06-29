import mongoose from 'mongoose';
import { WINDOW_KEYS } from '../utils/delivery.js';

/**
 * One bookable delivery window on one calendar day.
 * Slots are "occupied by default": a day/window is only bookable when an admin
 * has created a record here with available=true. No record === occupied.
 */
const deliverySlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // 'YYYY-MM-DD' (local)
    window: { type: String, required: true, enum: WINDOW_KEYS },
    available: { type: Boolean, default: true }, // true = open for booking
    note: { type: String, default: '' }, // optional admin note (e.g. "Holiday")
  },
  { timestamps: true }
);

// One record per (date, window).
deliverySlotSchema.index({ date: 1, window: 1 }, { unique: true });

const DeliverySlot = mongoose.model('DeliverySlot', deliverySlotSchema);
export default DeliverySlot;
