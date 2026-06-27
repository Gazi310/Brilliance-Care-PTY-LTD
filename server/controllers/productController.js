import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';

const EDITABLE = ['name', 'description', 'category', 'price', 'image', 'stock', 'available', 'rating'];

// GET /api/products?search=&category=
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;
  const filter = {};
  if (category && category !== 'All') filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const products = await Product.find(filter).sort({ createdAt: 1 });
  res.json(products);
});

// GET /api/products/:id
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// POST /api/products  (admin) — add a new product
export const createProduct = asyncHandler(async (req, res) => {
  const data = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) data[f] = req.body[f];
  if (!data.name) {
    res.status(400);
    throw new Error('A product name is required');
  }
  const product = await Product.create(data);
  res.status(201).json(product);
});

// PUT /api/products/:id  (admin) — update any editable fields
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  for (const f of EDITABLE) if (req.body[f] !== undefined) product[f] = req.body[f];
  await product.save();
  res.json(product);
});

// PATCH /api/products/:id/stock  (admin) — quick stock / availability setter
export const setStock = asyncHandler(async (req, res) => {
  const { stock, available } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (stock !== undefined) product.stock = Math.max(0, Number(stock) || 0);
  if (available !== undefined) product.available = Boolean(available);
  await product.save();
  res.json(product);
});

// DELETE /api/products/:id  (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ message: 'Product removed', _id: req.params.id });
});
