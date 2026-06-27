import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// POST /api/orders — checkout: validate stock, then decrement it.
export const createOrder = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ productId, qty }]
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  const lineItems = [];
  let total = 0;

  // 1) Validate everything before touching stock.
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
    lineItems.push({ product: product._id, name: product.name, price: product.price, qty });
    total += product.price * qty;
  }

  // 2) Decrement stock for each line item.
  for (const li of lineItems) {
    await Product.updateOne({ _id: li.product }, { $inc: { stock: -li.qty } });
  }

  const order = await Order.create({
    user: req.user?._id || null,
    items: lineItems,
    total: Math.round(total * 100) / 100,
    status: 'paid',
  });

  res.status(201).json(order);
});

// GET /api/orders/mine  (protected)
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});
