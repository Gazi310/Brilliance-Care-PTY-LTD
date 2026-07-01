import asyncHandler from '../utils/asyncHandler.js';
import LaundryService from '../models/LaundryService.js';

const EDITABLE = ['name', 'description', 'price', 'image', 'unit', 'turnaround', 'available', 'sort'];

// GET /api/laundry-services  (public) — list bookable laundry services
export const getLaundryServices = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  const services = await LaundryService.find(filter).sort({ sort: 1, createdAt: 1 });
  res.json(services);
});

// GET /api/laundry-services/:id  (public)
export const getLaundryService = asyncHandler(async (req, res) => {
  const service = await LaundryService.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Laundry service not found');
  }
  res.json(service);
});

// POST /api/laundry-services  (admin) — add a new service
export const createLaundryService = asyncHandler(async (req, res) => {
  const data = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) data[f] = req.body[f];
  if (!data.name) {
    res.status(400);
    throw new Error('A service name is required');
  }
  const service = await LaundryService.create(data);
  res.status(201).json(service);
});

// PUT /api/laundry-services/:id  (admin) — update editable fields
export const updateLaundryService = asyncHandler(async (req, res) => {
  const service = await LaundryService.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Laundry service not found');
  }
  for (const f of EDITABLE) if (req.body[f] !== undefined) service[f] = req.body[f];
  await service.save();
  res.json(service);
});

// DELETE /api/laundry-services/:id  (admin)
export const deleteLaundryService = asyncHandler(async (req, res) => {
  const service = await LaundryService.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Laundry service not found');
  }
  await service.deleteOne();
  res.json({ message: 'Laundry service removed', _id: req.params.id });
});
