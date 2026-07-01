import mongoose from 'mongoose';

/**
 * A bookable laundry service the company offers (e.g. "Wash & Fold").
 * Managed by admins exactly like products: name, photo and charge. Services
 * have no stock — they are booked, not sold — so there is no `stock` field.
 */
const laundryServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0, default: 0 }, // the charge
    image: { type: String, default: '🧺' }, // emoji or uploaded photo URL
    unit: { type: String, default: 'per load' }, // e.g. 'per load', 'per item'
    turnaround: { type: String, default: '48h' }, // display-only flavour text
    available: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LaundryService = mongoose.model('LaundryService', laundryServiceSchema);
export default LaundryService;
