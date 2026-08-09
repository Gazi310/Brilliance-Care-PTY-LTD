import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 3 },
    isAdmin: { type: Boolean, default: false },
    adminNote: { type: String, default: '' }, // private note shown only in /admin/customers

    /* ---- Profile (Phase 3, /account/profile) ----------------------
       Everything below is optional and defaulted, so existing accounts
       keep working untouched. The point of storing it is the booking
       flow: address and phone prefill StepDetails, which is most of
       why a customer bothers creating an account at all. */

    phone: { type: String, default: '', trim: true, maxlength: 40 },

    // Default pickup/delivery address.
    address: {
      street: { type: String, default: '', trim: true, maxlength: 160 },
      suburb: { type: String, default: '', trim: true, maxlength: 80 },
      postcode: { type: String, default: '', trim: true, maxlength: 4 },
      notes: { type: String, default: '', trim: true, maxlength: 500 }, // access notes
    },

    // Applied to every booking unless changed at checkout.
    preferences: {
      detergent: { type: String, default: 'Fragrance-free', trim: true, maxlength: 60 },
      shirts: { type: String, enum: ['Folded', 'On hangers'], default: 'Folded' },
      allergies: { type: String, default: '', trim: true, maxlength: 300 },
    },

    // Which messages this customer has opted into. Transactional ones
    // default on; marketing defaults off — opt-in, not opt-out.
    notifications: {
      driverSms: { type: Boolean, default: true },
      invoiceEmail: { type: Boolean, default: true },
      reminder: { type: Boolean, default: true },
      offers: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Hash the password whenever it is set or changed.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
