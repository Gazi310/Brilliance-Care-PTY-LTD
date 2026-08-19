import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

function shapeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    phone: user.phone || '',
    address: {
      street: user.address?.street || '',
      suburb: user.address?.suburb || '',
      postcode: user.address?.postcode || '',
      notes: user.address?.notes || '',
    },
    preferences: {
      detergent: user.preferences?.detergent || 'Fragrance-free',
      shirts: user.preferences?.shirts || 'Folded',
      allergies: user.preferences?.allergies || '',
    },
    notifications: {
      driverSms: user.notifications?.driverSms !== false,
      invoiceEmail: user.notifications?.invoiceEmail !== false,
      reminder: user.notifications?.reminder !== false,
      offers: user.notifications?.offers === true,
    },
  };
}

/**
 * POST /api/auth/register
 *
 * `phone` is optional but asked for at sign-up on purpose: guest bookings
 * are matched to a customer by phone number (see /admin/customers), so
 * capturing it here is what lets someone who booked as a guest last month
 * find that job in their account today.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const cleanPhone = String(phone ?? '').trim();
  if (cleanPhone.length > 40) {
    res.status(400);
    throw new Error('Phone must be 40 characters or fewer');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone: cleanPhone });
  res.status(201).json({ user: shapeUser(user), token: generateToken(user._id) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  if (!user || !(await user.matchPassword(password || ''))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({ user: shapeUser(user), token: generateToken(user._id) });
});

// GET /api/auth/me  (protected)
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: shapeUser(req.user) });
});

/**
 * PUT /api/auth/profile  (protected)
 *
 * Patch semantics: only the keys present in the body are touched, so the
 * four cards on /account/profile can each save independently without
 * clobbering the others. Nested objects merge rather than replace for the
 * same reason — sending `{ address: { suburb } }` must not blank the street.
 *
 * Deliberately cannot change: email (it's the login identity), password
 * (needs the current one to be re-entered) and isAdmin (privilege escalation).
 */
export const updateProfile = asyncHandler(async (req, res) => {
  // Re-read the full document rather than mutating `req.user`: `protect`
  // loads it with `.select('-password')`, and saving a doc whose required
  // password path was never selected relies on Mongoose projection
  // subtleties that aren't worth depending on here.
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('Account not found');
  }
  const b = req.body || {};

  const str = (v, max, label) => {
    const s = String(v ?? '').trim();
    if (s.length > max) {
      res.status(400);
      throw new Error(`${label} must be ${max} characters or fewer`);
    }
    return s;
  };

  if (b.name !== undefined) {
    const name = str(b.name, 120, 'Name');
    if (!name) {
      res.status(400);
      throw new Error('Name cannot be empty');
    }
    user.name = name;
  }

  if (b.phone !== undefined) user.phone = str(b.phone, 40, 'Phone');

  if (b.address !== undefined && b.address !== null) {
    const a = b.address;
    if (a.street !== undefined) user.address.street = str(a.street, 160, 'Street address');
    if (a.suburb !== undefined) user.address.suburb = str(a.suburb, 80, 'Suburb');
    if (a.notes !== undefined) user.address.notes = str(a.notes, 500, 'Access notes');
    if (a.postcode !== undefined) {
      const pc = String(a.postcode ?? '').trim();
      if (pc && !/^\d{4}$/.test(pc)) {
        res.status(400);
        throw new Error('Postcode must be 4 digits');
      }
      user.address.postcode = pc;
    }
  }

  if (b.preferences !== undefined && b.preferences !== null) {
    const p = b.preferences;
    if (p.detergent !== undefined) user.preferences.detergent = str(p.detergent, 60, 'Detergent');
    if (p.allergies !== undefined) user.preferences.allergies = str(p.allergies, 300, 'Allergies');
    if (p.shirts !== undefined) {
      const s = String(p.shirts).trim();
      if (!['Folded', 'On hangers'].includes(s)) {
        res.status(400);
        throw new Error('Shirts must be returned Folded or On hangers');
      }
      user.preferences.shirts = s;
    }
  }

  if (b.notifications !== undefined && b.notifications !== null) {
    for (const key of ['driverSms', 'invoiceEmail', 'reminder', 'offers']) {
      if (b.notifications[key] !== undefined) {
        user.notifications[key] = Boolean(b.notifications[key]);
      }
    }
  }

  await user.save();
  res.json({ user: shapeUser(user) });
});
