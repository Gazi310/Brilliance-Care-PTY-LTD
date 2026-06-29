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

// Snapshot of the delivery window the customer booked at checkout.
const deliverySlotSchema = new mongoose.Schema(
  {
    date: String, // 'YYYY-MM-DD'
    window: String, // morning | afternoon | evening
    label: String, // e.g. 'Afternoon'
    time: String, // e.g. '12:00 – 16:00'
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: { type: [orderItemSchema], required: true },
    deliverySlot: { type: deliverySlotSchema, default: null },
    total: { type: Number, required: true, default: 0 },
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
