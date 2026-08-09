import mongoose from 'mongoose';

/**
 * An enquiry sent from the public /contact form.
 *
 * Stored rather than emailed-and-forgotten on purpose: the mock notifier
 * (utils/notifications.js) only logs to the console today, so if this were
 * notification-only every enquiry would be lost until a real mail provider
 * is wired in. The admin inbox reads from here, and a real provider later
 * becomes an addition rather than a rescue.
 *
 * `topic` mirrors the select on the contact form. It is a free string with
 * a whitelist checked in the controller rather than a schema enum, so
 * adding an option to the form doesn't require a migration.
 */
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, default: '', trim: true, maxlength: 40 },
    topic: { type: String, default: 'Something else', trim: true, maxlength: 80 },
    message: { type: String, required: true, trim: true, maxlength: 4000 },

    // Inbox workflow: new → read → closed. `new` is what the admin badge counts.
    status: {
      type: String,
      enum: ['new', 'read', 'closed'],
      default: 'new',
      index: true,
    },

    // Set when an admin moves it out of `new`, so "who dealt with this" is answerable.
    handledAt: { type: Date, default: null },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Populated when a logged-in customer sends the form, so the enquiry can
    // be tied back to their orders. Null for guests — most enquiries.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// The inbox is always "newest first, optionally filtered by status".
contactMessageSchema.index({ status: 1, createdAt: -1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
