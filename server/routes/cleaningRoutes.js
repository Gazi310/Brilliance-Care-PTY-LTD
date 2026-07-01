import { Router } from 'express';
import {
  getCleaningServices,
  getCleaningService,
  createCleaningService,
  updateCleaningService,
  deleteCleaningService,
} from '../controllers/cleaningController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router
  .route('/')
  .get(getCleaningServices)
  .post(protect, admin, createCleaningService);

router
  .route('/:id')
  .get(getCleaningService)
  .put(protect, admin, updateCleaningService)
  .delete(protect, admin, deleteCleaningService);

export default router;
