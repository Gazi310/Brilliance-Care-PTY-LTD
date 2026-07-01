import asyncHandler from '../utils/asyncHandler.js';
import CleaningService from '../models/CleaningService.js';

const EDITABLE = ['name', 'description', 'price', 'image', 'unit', 'duration', 'available', 'sort'];

// GET /api/cleaning-services  (public) — list bookable cleaning services
export const getCleaningServices = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  const services = await CleaningService.find(filter).sort({ sort: 1, createdAt: 1 });
  res.json(services);
});

// GET /api/cleaning-services/:id  (public)
export const getCleaningService = asyncHandler(async (req, res) => {
  const service = await CleaningService.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Cleaning service not found');
  }
  res.json(service);
});

// POST /api/cleaning-services  (admin) — add a new service
export const createCleaningService = asyncHandler(async (req, res) => {
  const data = {};
  for (const f of EDITABLE) if (req.body[f] !== undefined) data[f] = req.body[f];
  if (!data.name) {
    res.status(400);
    throw new Error('A service name is required');
  }
  const service = await CleaningService.create(data);
  res.status(201).json(service);
});

// PUT /api/cleaning-services/:id  (admin) — update editable fields
export const updateCleaningService = asyncHandler(async (req, res) => {
  const service = await CleaningService.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Cleaning service not found');
  }
  for (const f of EDITABLE) if (req.body[f] !== undefined) service[f] = req.body[f];
  await service.save();
  res.json(service);
});

// DELETE /api/cleaning-services/:id  (admin)
export const deleteCleaningService = asyncHandler(async (req, res) => {
  const service = await CleaningService.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error('Cleaning service not found');
  }
  await service.deleteOne();
  res.json({ message: 'Cleaning service removed', _id: req.params.id });
});
