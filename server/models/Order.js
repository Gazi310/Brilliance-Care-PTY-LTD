import mongoose from 'mongoose';
import { nextSequence, highestNumber } from '../utils/sequence.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// A booked laundry service line (no stock — booked, not sold).
const laundryItemSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'LaundryService', required: true },
    name: String,
    price: Number,
    unit: String,
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// A booked cleaning service line (no stock — booked, not sold).
const cleaningItemSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'CleaningService', required: true },
    name: String,
    price: Number,
    unit: String,
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// Snapshot of a chosen delivery/pickup window.
const slotSchema = new mongoose.Schema(
  {
    date: String, // 'YYYY-MM-DD'
    window: String, // morning | afternoon | evening
    label: String, // e.g. 'Afternoon'
    time: String, // e.g. '12:00 – 16:00'
  },
  { _id: false }
);

// A unique home visit the crew must make (deduplicated across all slots).
const visitSchema = new mongoose.Schema(
  {
    date: String,
    window: String,
    label: String,
    time: String,
    roles: [String], // what this visit covers: 'delivery' | 'pickup' | 'return' | 'cleaning'
  },
  { _id: false }
);

/**
 * One line of a service booking, carrying BOTH the estimate shown at booking
 * time and (after Phase 2's assessment) the actual measured values, so the
 * invoice can show "est 8 kg → actual 10.4 kg" per line.
 */
const bookingLineSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['laundry', 'cleaning', 'addon'], required: true },
    serviceRef: { type: mongoose.Schema.Types.ObjectId, default: null }, // Laundry/CleaningService id
    label: { type: String, required: true }, // e.g. 'Wash & Fold' or 'Deep Cleaning · 3 bed · 2 bath'
    unit: { type: String, default: '' },
    estQty: { type: Number, default: 1 },
    estUnitPrice: { type: Number, default: 0 },
    estAmount: { type: Number, default: 0 },
    actualQty: { type: Number, default: null },
    actualUnitPrice: { type: Number, default: null },
    actualAmount: { type: Number, default: null },
    note: { type: String, default: '' },
  },
  { _id: false }
);

// Where the crew goes. AU format: line1, suburb, state, postcode.
const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, default: '' },
    suburb: { type: String, default: '' },
    state: { type: String, default: '' },
    postcode: { type: String, default: '' },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { _id: false }
);

/**
 * One Order document covers both worlds:
 *  - kind 'shop'    — retail products, paid in full at checkout (legacy flow).
 *  - kind 'booking' — laundry/cleaning service with the estimate → deposit →
 *                     invoice → balance model (blueprint §2 / §9).
 */
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    kind: { type: String, enum: ['shop', 'booking'], default: 'shop' },
    orderNumber: { type: String, unique: true, sparse: true }, // e.g. BC-1042
    service: { type: String, enum: ['laundry', 'cleaning', 'combo', null], default: null },

    items: { type: [orderItemSchema], default: [] }, // product lines
    laundryItems: { type: [laundryItemSchema], default: [] }, // laundry lines
    cleaningItems: { type: [cleaningItemSchema], default: [] }, // cleaning lines

    // Booking estimate lines (est vs actual) — the invoice-ready shape.
    lineItems: { type: [bookingLineSchema], default: [] },

    // Chosen windows. Product delivery + laundry pickup/return + cleaning visit.
    deliverySlot: { type: slotSchema, default: null },
    laundryPickupSlot: { type: slotSchema, default: null },
    laundryReturnSlot: { type: slotSchema, default: null },
    cleaningSlot: { type: slotSchema, default: null },

    // The de-duplicated set of home visits and how the fee was computed.
    visits: { type: [visitSchema], default: [] },
    deliveryFee: { type: Number, default: 0 }, // per-visit rate at time of order
    deliveryTotal: { type: Number, default: 0 }, // fee × number of unique visits

    subtotal: { type: Number, default: 0 }, // items + laundry + cleaning, before delivery
    total: { type: Number, required: true, default: 0 }, // subtotal + deliveryTotal

    // ---- Estimate & two-stage payment (bookings) ----
    estimatedSubtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 }, // GST included in the total (total / 11 at 10%)
    estimatedTotal: { type: Number, default: 0 },
    depositPercent: { type: Number, default: 0 }, // e.g. 50 (from Settings at booking time)
    depositAmount: { type: Number, default: 0 },
    depositStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    depositPaymentId: { type: String, default: '' },

    // Filled by Phase 2's assess & invoice loop.
    actualTotal: { type: Number, default: null },
    balanceDue: { type: Number, default: null },
    balanceStatus: { type: String, enum: ['none', 'awaiting', 'paid', 'waived'], default: 'none' },
    balancePaymentId: { type: String, default: '' },
    invoiceRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', default: null },
    assessmentNote: { type: String, default: '' }, // admin's "why it changed" note

    // ---- Logistics (bookings) ----
    address: { type: addressSchema, default: null },
    contact: { type: contactSchema, default: null },
    accessNotes: { type: String, default: '' },
    specialInstructions: { type: String, default: '' },

    status: {
      type: String,
      enum: [
        // shop lifecycle (legacy)
        'pending', 'fulfilled',
        // booking lifecycle (blueprint §9)
        'booked', 'deposit_paid', 'scheduled', 'picked_up', 'in_progress',
        'assessed', 'ready', 'out_for_delivery', 'delivered',
        // shared
        'paid', 'cancelled',
      ],
      default: 'paid',
    },
  },
  { timestamps: true }
);

/* ---- Indexes for the queries this collection actually serves -------------
   Without these every admin dashboard load and every "my orders" fetch is a
   full collection scan, which an Atlas M0 feels long before the data looks
   big. Each one mirrors a real query: see orderController (mine),
   adminOrderController (queue), adminStatsController (today / this week). */
orderSchema.index({ user: 1, createdAt: -1 }); // GET /api/orders/mine
orderSchema.index({ kind: 1, status: 1, createdAt: -1 }); // admin order queue
orderSchema.index({ 'visits.date': 1, status: 1 }); // today's runs + week view
orderSchema.index({ createdAt: -1 }); // dashboard date-range aggregations

// Human-friendly sequential order number, shared across shop + bookings.
//
// Allocated from an atomic counter rather than a document count: two checkouts
// at the same moment used to read the same count, build the same number and
// collide on the unique index above, failing one customer's order at the very
// last step. estimatedDocumentCount() made it worse by being an estimate.
orderSchema.pre('save', async function assignNumber(next) {
  if (!this.isNew || this.orderNumber) return next();
  try {
    const seq = await nextSequence('order', async () =>
      Math.max(1000, await highestNumber(this.constructor, 'orderNumber', 'BC-'))
    );
    this.orderNumber = `BC-${seq}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
// Order model: shop orders (pay in full) + service bookings (deposit model).
