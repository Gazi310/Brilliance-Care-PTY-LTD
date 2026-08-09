import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ContactMessage from '../models/ContactMessage.js';
import { notifyContactReceived } from '../utils/notifications.js';

/**
 * Public contact form + the admin inbox that reads it.
 *
 * The write path is deliberately the only unauthenticated POST in the app
 * that creates a document, so it validates hard: length caps, a real email
 * shape, and a honeypot field. Everything else here is admin-only.
 */

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Must match the options in client/src/pages/Contact.jsx. */
const TOPICS = [
  'A booking I’ve already made',
  'A quote for something unusual',
  'Commercial or bulk enquiry',
  'Something went wrong',
  'Something else',
];

const shape = (m) => ({
  id: String(m._id),
  name: m.name,
  email: m.email,
  phone: m.phone,
  topic: m.topic,
  message: m.message,
  status: m.status,
  handledAt: m.handledAt,
  user: m.user ? String(m.user) : null,
  createdAt: m.createdAt,
});

/* ------------------------------------------------------------------ */
/*  POST /api/contact  (public)                                        */
/* ------------------------------------------------------------------ */
export const createMessage = asyncHandler(async (req, res) => {
  // Honeypot: a real browser leaves this hidden field empty. Bots fill it.
  // Answer 201 anyway so a crawler learns nothing from the difference.
  if (String(req.body.company || '').trim()) {
    return res.status(201).json({ ok: true });
  }

  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const message = String(req.body.message || '').trim();
  const topicRaw = String(req.body.topic || '').trim();

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email and a message are required');
  }
  if (name.length > 120) {
    res.status(400);
    throw new Error('Name must be 120 characters or fewer');
  }
  if (!EMAIL_RX.test(email) || email.length > 160) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }
  if (phone.length > 40) {
    res.status(400);
    throw new Error('Phone must be 40 characters or fewer');
  }
  if (message.length > 4000) {
    res.status(400);
    throw new Error('Message must be 4000 characters or fewer');
  }

  const topic = TOPICS.includes(topicRaw) ? topicRaw : 'Something else';

  const doc = await ContactMessage.create({
    name,
    email,
    phone,
    topic,
    message,
    // `protect` doesn't run on this route, but if a token happened to be
    // resolved upstream we keep the link. Guests are the normal case.
    user: req.user?._id || null,
  });

  // Best-effort only — a failed notification must not lose the enquiry,
  // which is already safely stored above.
  try {
    await notifyContactReceived(doc);
  } catch {
    /* logged by the notifier; the inbox is the source of truth */
  }

  res.status(201).json({ ok: true, id: String(doc._id) });
});

/* ------------------------------------------------------------------ */
/*  GET /api/contact  (admin) — the inbox                              */
/* ------------------------------------------------------------------ */
export const listMessages = asyncHandler(async (req, res) => {
  const status = String(req.query.status || '').trim();
  const filter = ['new', 'read', 'closed'].includes(status) ? { status } : {};

  const [messages, newCount] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).limit(200),
    ContactMessage.countDocuments({ status: 'new' }),
  ]);

  res.json({ messages: messages.map(shape), newCount });
});

/* ------------------------------------------------------------------ */
/*  PATCH /api/contact/:id  (admin) — move it through the workflow     */
/* ------------------------------------------------------------------ */
export const setMessageStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400);
    throw new Error('Invalid message id');
  }

  const status = String(req.body.status || '').trim();
  if (!['new', 'read', 'closed'].includes(status)) {
    res.status(400);
    throw new Error('Status must be new, read or closed');
  }

  const doc = await ContactMessage.findById(id);
  if (!doc) {
    res.status(404);
    throw new Error('Message not found');
  }

  doc.status = status;
  // Reopening clears the audit stamp so it doesn't claim to be handled.
  doc.handledAt = status === 'new' ? null : new Date();
  doc.handledBy = status === 'new' ? null : req.user._id;
  await doc.save();

  res.json({ message: shape(doc) });
});
