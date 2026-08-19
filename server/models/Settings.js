import mongoose from 'mongoose';

/**
 * Global store settings — a single document keyed by `key: 'global'`.
 * Holds the flat delivery fee charged per home visit (see orderController for
 * how visits are de-duplicated so a shared slot is only billed once), the
 * deposit/GST knobs that drive the estimate → deposit → invoice model, and
 * (Phase 3) the business identity + service-area details that feed the
 * Footer, contact surfaces and the homepage postcode checker.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    deliveryFee: { type: Number, default: 9.99, min: 0 },
    depositPercent: { type: Number, default: 50, min: 0, max: 100 }, // % of estimate paid to book
    gstEnabled: { type: Boolean, default: true }, // off → totals carry no GST component
    gstRate: { type: Number, default: 0.1, min: 0 }, // AU GST — prices are shown GST-inclusive
    currency: { type: String, default: 'AUD' },

    // How far ahead customers may book, counting today as day one. Applies to
    // the scopes in HORIZON_SCOPES (laundry, today): a day past this reads as
    // "unavailable" rather than "booked". See utils/delivery.js.
    bookingWindowDays: { type: Number, default: 14, min: 1, max: 60 },

    // ---- Business identity (shown in Footer / contact / invoices later) ----
    businessName: { type: String, default: 'Brilliance Care PTY LTD' },
    abn: { type: String, default: '' },
    businessPhone: { type: String, default: '' },
    businessEmail: { type: String, default: '' },
    businessAddress: { type: String, default: '' }, // e.g. 'Parramatta NSW 2150'
    businessHours: { type: String, default: 'Mon – Sat · 8:00 – 18:00' },

    // 4-digit postcodes we service. Empty array = no restriction (any valid
    // AU postcode passes the homepage checker).
    servicePostcodes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
