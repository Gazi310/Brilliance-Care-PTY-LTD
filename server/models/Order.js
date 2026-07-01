import mongoose from 'mongoose';

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

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    items: { type: [orderItemSchema], default: [] }, // product lines
    laundryItems: { type: [laundryItemSchema], default: [] }, // laundry lines
    cleaningItems: { type: [cleaningItemSchema], default: [] }, // cleaning lines

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

    status: {
      type: String,
      enum: ['pending', 'paid', 'fulfilled', 'cancelled'],
      default: 'paid',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
// Order model: products + laundry + cleaning lines, with de-duplicated home visits.
