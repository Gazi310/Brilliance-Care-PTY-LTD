import mongoose from 'mongoose';

/**
 * A bookable cleaning service the company offers (e.g. "Standard Home Clean").
 * Managed by admins exactly like laundry services: name, photo and charge.
 * Cleaning is performed on-site, so there is no stock — services are booked,
 * not sold — and a booking needs a single appointment visit.
 *
 * Pricing (blueprint §4.5 — type + home size + add-ons):
 *  - pricingMode 'home' — `price` covers a 1-bed / 1-bath home; each extra
 *    bedroom adds `perBedroom`, each extra bathroom adds `perBathroom`.
 *  - pricingMode 'flat' — `price` per unit (visit/room), sized by qty.
 *  - isAddon — a flat extra (oven, windows, carpet…) offered on top of a
 *    main clean in the booking flow.
 * All prices remain ESTIMATES — the final invoice reflects the real state
 * and size of the home.
 */
const cleaningServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0, default: 0 }, // base charge (1 bed / 1 bath when 'home')
    image: { type: String, default: '🫧' }, // emoji or uploaded photo URL
    unit: { type: String, default: 'per visit' }, // e.g. 'per visit', 'per room'
    duration: { type: String, default: '2h' }, // display-only flavour text
    available: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },

    // Home-size pricing model
    pricingMode: { type: String, enum: ['flat', 'home'], default: 'flat' },
    perBedroom: { type: Number, default: 0, min: 0 }, // per bedroom beyond the first
    perBathroom: { type: Number, default: 0, min: 0 }, // per bathroom beyond the first
    isAddon: { type: Boolean, default: false }, // offered as an extra on a main clean
  },
  { timestamps: true }
);

const CleaningService = mongoose.model('CleaningService', cleaningServiceSchema);
export default CleaningService;
