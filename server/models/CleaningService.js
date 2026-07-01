import mongoose from 'mongoose';

/**
 * A bookable cleaning service the company offers (e.g. "Standard Home Clean").
 * Managed by admins exactly like laundry services: name, photo and charge.
 * Cleaning is performed on-site, so there is no stock — services are booked,
 * not sold — and a booking needs a single appointment visit.
 */
const cleaningServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0, default: 0 }, // the charge
    image: { type: String, default: '🫧' }, // emoji or uploaded photo URL
    unit: { type: String, default: 'per visit' }, // e.g. 'per visit', 'per room'
    duration: { type: String, default: '2h' }, // display-only flavour text
    available: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const CleaningService = mongoose.model('CleaningService', cleaningServiceSchema);
export default CleaningService;
