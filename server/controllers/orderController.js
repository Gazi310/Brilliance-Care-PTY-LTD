import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';
import LaundryService from '../models/LaundryService.js';
import CleaningService from '../models/CleaningService.js';
import Order from '../models/Order.js';
import { resolveOpenSlot } from './deliveryController.js';
import { getDeliveryFee } from './settingsController.js';

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Collapse the chosen delivery/pickup/return slots into the unique set of home
 * visits the crew must actually make. Two bookings on the same date+window are
 * a single visit, so the delivery fee is charged once for them.
 *
 * @param entries Array<{ slot, role }>  (slot already resolved/snapshotted)
 * @returns Array<visit> with a `roles` array describing what each visit covers.
 */
function dedupeVisits(entries) {
  const byKey = new Map();
  for (const { slot, role } of entries) {
    if (!slot) continue;
    const key = `${slot.date}|${slot.window}`;
    if (!byKey.has(key)) {
      byKey.set(key, { ...slot, roles: [role] });
    } else {
      byKey.get(key).roles.push(role);
    }
  }
  return [...byKey.values()];
}

/**
 * Hand back stock claimed earlier in a checkout that then failed, so an
 * abandoned attempt doesn't quietly consume inventory. Best effort: if one of
 * these fails there is nothing useful left to do about it, and throwing here
 * would mask the original error.
 */
async function releaseStock(lines) {
  for (const li of lines) {
    try {
      await Product.updateOne({ _id: li.product }, { $inc: { stock: li.qty } });
    } catch (err) {
      console.error(`⚠️  Could not return ${li.qty} × "${li.name}" to stock: ${err.message}`);
    }
  }
}

// POST /api/orders — checkout products and/or laundry services in one order.
export const createOrder = asyncHandler(async (req, res) => {
  const {
    items = [],
    laundryItems = [],
    cleaningItems = [],
    deliverySlot = null,
    laundryPickupSlot = null,
    laundryReturnSlot = null,
    cleaningSlot = null,
  } = req.body;

  const hasProducts = Array.isArray(items) && items.length > 0;
  const hasLaundry = Array.isArray(laundryItems) && laundryItems.length > 0;
  const hasCleaning = Array.isArray(cleaningItems) && cleaningItems.length > 0;

  if (!hasProducts && !hasLaundry && !hasCleaning) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // --- 1) Validate product lines (and stock) before touching anything ---
  const productLines = [];
  let subtotal = 0;
  for (const it of items) {
    const product = await Product.findById(it.productId);
    if (!product) {
      res.status(404);
      throw new Error('A product in your cart no longer exists');
    }
    const qty = Math.max(1, Number(it.qty) || 1);
    if (!product.available || product.stock < qty) {
      res.status(409);
      throw new Error(`Not enough stock for "${product.name}" — only ${product.stock} left`);
    }
    productLines.push({ product: product._id, name: product.name, price: product.price, qty });
    subtotal += product.price * qty;
  }

  // --- 2) Validate laundry lines ---
  const laundryLines = [];
  for (const it of laundryItems) {
    const service = await LaundryService.findById(it.serviceId);
    if (!service || !service.available) {
      res.status(404);
      throw new Error('A laundry service in your cart is no longer available');
    }
    const qty = Math.max(1, Number(it.qty) || 1);
    laundryLines.push({
      service: service._id,
      name: service.name,
      price: service.price,
      unit: service.unit,
      qty,
    });
    subtotal += service.price * qty;
  }

  // --- 2b) Validate cleaning lines ---
  const cleaningLines = [];
  for (const it of cleaningItems) {
    const service = await CleaningService.findById(it.serviceId);
    if (!service || !service.available) {
      res.status(404);
      throw new Error('A cleaning service in your cart is no longer available');
    }
    const qty = Math.max(1, Number(it.qty) || 1);
    cleaningLines.push({
      service: service._id,
      name: service.name,
      price: service.price,
      unit: service.unit,
      qty,
    });
    subtotal += service.price * qty;
  }

  // --- 3) Resolve the required slots (each must currently be open) ---
  // Shop products are delivered on the seller's schedule, so customers no
  // longer pick a delivery slot — deliverySlot is ignored for products.
  let pickup = null;
  let dropoff = null;
  let cleaning = null;

  if (hasLaundry) {
    if (!laundryPickupSlot || !laundryReturnSlot) {
      res.status(400);
      throw new Error('Please choose both a pickup and a return slot for your laundry');
    }
    pickup = await resolveOpenSlot(res, laundryPickupSlot, 'laundry');
    dropoff = await resolveOpenSlot(res, laundryReturnSlot, 'laundry');
  }
  if (hasCleaning) {
    if (!cleaningSlot) {
      res.status(400);
      throw new Error('Please choose an appointment slot for your cleaning');
    }
    cleaning = await resolveOpenSlot(res, cleaningSlot, 'cleaning');
  }

  // --- 4) De-duplicate visits and price delivery once per unique visit ---
  const visits = dedupeVisits([
    { slot: pickup, role: 'pickup' },
    { slot: dropoff, role: 'return' },
    { slot: cleaning, role: 'cleaning' },
  ]);
  const fee = await getDeliveryFee();
  // One flat delivery fee for the (seller-scheduled) product drop-off, plus one
  // per unique service visit.
  const productDeliveries = hasProducts ? 1 : 0;
  const deliveryTotal = round2(fee * (visits.length + productDeliveries));
  subtotal = round2(subtotal);
  const total = round2(subtotal + deliveryTotal);

  // --- 5) Commit: claim product stock, then save the order ---
  //
  // The `stock: { $gte: qty }` guard is the point of this block. Step 1 only
  // *read* the stock level; between that read and this write another customer
  // can buy the same unit. Conditioning the decrement on there still being
  // enough left makes check-and-take a single atomic operation, so the loser
  // gets a clean 409 instead of stock silently going negative.
  const claimed = [];
  for (const li of productLines) {
    const result = await Product.updateOne(
      { _id: li.product, available: true, stock: { $gte: li.qty } },
      { $inc: { stock: -li.qty } }
    );
    if (result.modifiedCount !== 1) {
      await releaseStock(claimed);
      res.status(409);
      throw new Error(`"${li.name}" just sold out — please review your cart`);
    }
    claimed.push(li);
  }

  let order;
  try {
    order = await Order.create({
      user: req.user?._id || null,
      kind: 'shop',
      items: productLines,
      laundryItems: laundryLines,
      cleaningItems: cleaningLines,
      deliverySlot: null,
      laundryPickupSlot: pickup,
      laundryReturnSlot: dropoff,
      cleaningSlot: cleaning,
      visits,
      deliveryFee: fee,
      deliveryTotal,
      subtotal,
      total,
      status: 'paid',
    });
  } catch (err) {
    // The order didn't save, so nobody is getting these items — put them back.
    await releaseStock(claimed);
    throw err;
  }

  res.status(201).json(order);
});

// GET /api/orders/mine  (protected)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// GET /api/orders/:id  (protected — owner or admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const isOwner = order.user && order.user.toString() === req.user._id.toString();
  if (!isOwner && !req.user.isAdmin) {
    res.status(403);
    throw new Error('This order belongs to another account');
  }
  res.json(order);
});
