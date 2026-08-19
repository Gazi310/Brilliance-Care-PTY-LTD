import mongoose from 'mongoose';

/**
 * One document per named sequence ('order', 'invoice'), holding the last
 * number issued. Exists so human-friendly reference numbers can be handed out
 * atomically: `findOneAndUpdate({$inc})` is a single round trip that the
 * database serialises for us, so two checkouts landing at the same instant get
 * different numbers instead of both computing the same one from a count and
 * colliding on the unique index.
 *
 * See utils/sequence.js for the allocator.
 */
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // sequence name
    seq: { type: Number, required: true, default: 0 }, // last number issued
  },
  { versionKey: false }
);

const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
