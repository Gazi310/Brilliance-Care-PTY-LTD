import mongoose from 'mongoose';
import { nextSequence, highestNumber } from '../utils/sequence.js';

/**
 * One line of the final bill, carrying the original estimate next to the
 * assessed actual so the customer sees exactly what changed and why
 * (blueprint §4.11 — "Wash & Fold: est 8 kg → 10.4 kg").
 * Snapshotted from the order's lineItems at invoice time.
 */
const invoiceLineSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['laundry', 'cleaning', 'addon'], required: true },
    serviceRef: { type: mongoose.Schema.Types.ObjectId, default: null },
    label: { type: String, required: true },
    unit: { type: String, default: '' },
    estQty: { type: Number, default: 0 }, // 0 = line added during assessment
    estUnitPrice: { type: Number, default: 0 },
    estAmount: { type: Number, default: 0 },
    actualQty: { type: Number, default: 0 },
    actualUnitPrice: { type: Number, default: 0 },
    actualAmount: { type: Number, default: 0 },
    note: { type: String, default: '' },
  },
  { _id: false }
);

// A record of one (mock) notification send — kept for the admin audit trail.
const sentRecordSchema = new mongoose.Schema(
  {
    channel: { type: String, enum: ['email', 'sms'], required: true },
    to: { type: String, default: '' },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * The final bill for a service booking (blueprint §9) — created by the admin's
 * Assess & Invoice screen once actuals are recorded. The customer pays the
 * remaining balance online (mock card provider for now) or on delivery.
 */
const invoiceSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    number: { type: String, unique: true, sparse: true }, // e.g. BC-INV-1001
    issuedAt: { type: Date, default: Date.now },

    lineItems: { type: [invoiceLineSchema], default: [] },

    // Actual money (GST-inclusive, like everything customer-facing).
    subtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 }, // GST included in the total (total / 11 at 10%)
    total: { type: Number, default: 0 }, // the ACTUAL total
    estimatedTotal: { type: Number, default: 0 }, // for the "estimate vs actual" delta
    depositApplied: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 }, // total − depositApplied (can be ≤ 0 = credit)

    status: { type: String, enum: ['draft', 'sent', 'paid', 'void'], default: 'sent' },
    note: { type: String, default: '' }, // "why it changed" — builds trust

    // How the balance was settled.
    paidAt: { type: Date, default: null },
    paymentMethod: {
      type: String,
      enum: ['', 'card_online', 'cash_on_delivery', 'card_on_delivery', 'waived', 'not_required'],
      default: '',
    },
    balancePaymentId: { type: String, default: '' },

    // Mock notification layer (utils/notifications.js) — what was "sent" where.
    sentChannels: { type: [String], default: [] },
    notifications: { type: [sentRecordSchema], default: [] },
  },
  { timestamps: true }
);

/* ---- Indexes for the queries this collection actually serves ---- */
invoiceSchema.index({ user: 1, createdAt: -1 }); // GET /api/invoices/mine
invoiceSchema.index({ order: 1 }); // invoice ↔ order lookups
invoiceSchema.index({ status: 1, paidAt: -1 }); // "paid today" dashboard tile

// Human-friendly sequential invoice number, allocated from the same atomic
// counter mechanism as Order.orderNumber — see utils/sequence.js.
invoiceSchema.pre('save', async function assignNumber(next) {
  if (!this.isNew || this.number) return next();
  try {
    const seq = await nextSequence('invoice', async () =>
      Math.max(1000, await highestNumber(this.constructor, 'number', 'BC-INV-'))
    );
    this.number = `BC-INV-${seq}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
// Invoice model: the est-vs-actual final bill of the deposit → balance loop.
