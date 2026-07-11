import asyncHandler from '../utils/asyncHandler.js';
import LaundryService from '../models/LaundryService.js';
import CleaningService from '../models/CleaningService.js';
import Order from '../models/Order.js';
import { resolveOpenSlot } from './deliveryController.js';
import { getDepositPercent, getGstAmount } from './settingsController.js';
import { chargeDeposit } from '../utils/payments.js';

const round2 = (n) => Math.round(n * 100) / 100;
const digits = (s) => String(s || '').replace(/\D/g, '');
const WINDOW_ORDER = ['morning', 'afternoon', 'evening'];

/** Collapse chosen slots into unique home visits (same date+window = one trip). */
function dedupeVisits(entries) {
  const byKey = new Map();
  for (const { slot, role } of entries) {
    if (!slot) continue;
    const key = `${slot.date}|${slot.window}`;
    if (!byKey.has(key)) byKey.set(key, { ...slot, roles: [role] });
    else byKey.get(key).roles.push(role);
  }
  return [...byKey.values()];
}

/** Return slot must be after the pickup slot (later day, or later window same-day). */
function assertReturnAfterPickup(res, pickup, ret) {
  const after =
    ret.date > pickup.date ||
    (ret.date === pickup.date &&
      WINDOW_ORDER.indexOf(ret.window) > WINDOW_ORDER.indexOf(pickup.window));
  if (!after) {
    res.status(400);
    throw new Error('The return window must be after the pickup window');
  }
}

/**
 * POST /api/bookings  (protected)
 * Create a laundry/cleaning service booking with a server-side recomputed
 * estimate (blueprint §2). Body:
 * {
 *   laundry:  [{ serviceId, qty }],
 *   cleaning: { serviceId, bedrooms, bathrooms, qty, addons: [{ serviceId, qty }] } | null,
 *   pickupSlot, returnSlot,        // laundry (required when laundry lines exist)
 *   cleaningSlot,                  // cleaning (required when a clean is chosen)
 *   address: { line1, suburb, state, postcode },
 *   contact: { name, phone },
 *   accessNotes, specialInstructions
 * }
 */
export const createBooking = asyncHandler(async (req, res) => {
  const {
    laundry = [],
    cleaning = null,
    pickupSlot = null,
    returnSlot = null,
    cleaningSlot = null,
    address = {},
    contact = {},
    accessNotes = '',
    specialInstructions = '',
  } = req.body;

  const hasLaundry = Array.isArray(laundry) && laundry.length > 0;
  const hasCleaning = Boolean(cleaning && cleaning.serviceId);
  if (!hasLaundry && !hasCleaning) {
    res.status(400);
    throw new Error('Add at least one laundry or cleaning service to book');
  }

  const lines = [];
  let estimatedSubtotal = 0;

  // --- Laundry lines ---
  for (const it of laundry) {
    const service = await LaundryService.findById(it.serviceId);
    if (!service || !service.available) {
      res.status(404);
      throw new Error('A laundry service in your booking is no longer available');
    }
    const qty = Math.max(1, Number(it.qty) || 1);
    const amount = round2(service.price * qty);
    lines.push({
      kind: 'laundry',
      serviceRef: service._id,
      label: service.name,
      unit: service.unit,
      estQty: qty,
      estUnitPrice: service.price,
      estAmount: amount,
    });
    estimatedSubtotal += amount;
  }

  // --- Cleaning line (type + home size) + add-ons ---
  if (hasCleaning) {
    const service = await CleaningService.findById(cleaning.serviceId);
    if (!service || !service.available) {
      res.status(404);
      throw new Error('That cleaning service is no longer available');
    }

    if (service.pricingMode === 'home') {
      const beds = Math.min(8, Math.max(1, Number(cleaning.bedrooms) || 1));
      const baths = Math.min(6, Math.max(1, Number(cleaning.bathrooms) || 1));
      const amount = round2(
        service.price + service.perBedroom * (beds - 1) + service.perBathroom * (baths - 1)
      );
      lines.push({
        kind: 'cleaning',
        serviceRef: service._id,
        label: `${service.name} · ${beds} bed · ${baths} bath`,
        unit: service.unit,
        estQty: 1,
        estUnitPrice: amount,
        estAmount: amount,
      });
      estimatedSubtotal += amount;
    } else {
      const qty = Math.max(1, Number(cleaning.qty) || 1);
      const amount = round2(service.price * qty);
      lines.push({
        kind: 'cleaning',
        serviceRef: service._id,
        label: service.name,
        unit: service.unit,
        estQty: qty,
        estUnitPrice: service.price,
        estAmount: amount,
      });
      estimatedSubtotal += amount;
    }

    for (const extra of cleaning.addons || []) {
      const addon = await CleaningService.findById(extra.serviceId);
      if (!addon || !addon.available || !addon.isAddon) {
        res.status(404);
        throw new Error('A cleaning add-on in your booking is no longer available');
      }
      const qty = Math.max(1, Number(extra.qty) || 1);
      const amount = round2(addon.price * qty);
      lines.push({
        kind: 'addon',
        serviceRef: addon._id,
        label: addon.name,
        unit: addon.unit,
        estQty: qty,
        estUnitPrice: addon.price,
        estAmount: amount,
      });
      estimatedSubtotal += amount;
    }
  }

  // --- Slots (each must currently be open) ---
  let pickup = null;
  let dropoff = null;
  let clean = null;
  if (hasLaundry) {
    if (!pickupSlot || !returnSlot) {
      res.status(400);
      throw new Error('Please choose both a pickup and a return window for your laundry');
    }
    pickup = await resolveOpenSlot(res, pickupSlot, 'laundry');
    dropoff = await resolveOpenSlot(res, returnSlot, 'laundry');
    assertReturnAfterPickup(res, pickup, dropoff);
  }
  if (hasCleaning) {
    if (!cleaningSlot) {
      res.status(400);
      throw new Error('Please choose an appointment window for your cleaning');
    }
    clean = await resolveOpenSlot(res, cleaningSlot, 'cleaning');
  }

  // --- Details ---
  const addr = {
    line1: String(address.line1 || '').trim(),
    suburb: String(address.suburb || '').trim(),
    state: String(address.state || '').trim().toUpperCase(),
    postcode: String(address.postcode || '').trim(),
  };
  if (!addr.line1 || !addr.suburb) {
    res.status(400);
    throw new Error('Please provide your street address and suburb');
  }
  if (!/^\d{4}$/.test(addr.postcode)) {
    res.status(400);
    throw new Error('Please provide a valid 4-digit postcode');
  }
  const who = {
    name: String(contact.name || '').trim(),
    phone: String(contact.phone || '').trim(),
  };
  if (!who.name || digits(who.phone).length < 8) {
    res.status(400);
    throw new Error('Please provide a contact name and a valid phone number');
  }

  // --- Totals (service pricing includes pickup & delivery — no visit fee) ---
  estimatedSubtotal = round2(estimatedSubtotal);
  const estimatedTotal = estimatedSubtotal;
  const gstAmount = await getGstAmount(estimatedTotal); // 0 when GST is off in settings
  const depositPercent = await getDepositPercent();
  const depositAmount = round2((estimatedTotal * depositPercent) / 100);

  const visits = dedupeVisits([
    { slot: pickup, role: 'pickup' },
    { slot: dropoff, role: 'return' },
    { slot: clean, role: 'cleaning' },
  ]);

  const order = await Order.create({
    user: req.user._id,
    kind: 'booking',
    service: hasLaundry && hasCleaning ? 'combo' : hasLaundry ? 'laundry' : 'cleaning',
    lineItems: lines,
    laundryPickupSlot: pickup,
    laundryReturnSlot: dropoff,
    cleaningSlot: clean,
    visits,
    deliveryFee: 0,
    deliveryTotal: 0,
    subtotal: estimatedSubtotal,
    total: estimatedTotal,
    estimatedSubtotal,
    gstAmount,
    estimatedTotal,
    depositPercent,
    depositAmount,
    depositStatus: 'unpaid',
    address: addr,
    contact: who,
    accessNotes: String(accessNotes || '').trim(),
    specialInstructions: String(specialInstructions || '').trim(),
    status: 'booked',
  });

  res.status(201).json(order);
});

/**
 * POST /api/bookings/:id/pay-deposit  (protected, owner or admin)
 * Charge the deposit through the payment provider (mock for now — see
 * utils/payments.js) and move the booking to `deposit_paid`.
 */
export const payDeposit = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.kind !== 'booking') {
    res.status(404);
    throw new Error('Booking not found');
  }
  const isOwner = order.user && order.user.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isAdmin) {
    res.status(403);
    throw new Error('This booking belongs to another account');
  }
  if (order.depositStatus === 'paid') {
    res.status(409);
    throw new Error('The deposit for this booking is already paid');
  }
  if (order.status === 'cancelled') {
    res.status(409);
    throw new Error('This booking was cancelled');
  }

  let payment;
  try {
    payment = await chargeDeposit(order, req.body.card || {});
  } catch (err) {
    res.status(err.statusCode || 402);
    throw err;
  }

  order.depositStatus = 'paid';
  order.depositPaymentId = payment.id;
  order.status = 'deposit_paid';
  await order.save();

  res.json(order);
});
