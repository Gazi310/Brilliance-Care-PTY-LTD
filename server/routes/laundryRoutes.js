import { Router } from 'express';
import {
  getLaundryServices,
  getLaundryService,
  createLaundryService,
  updateLaundryService,
  deleteLaundryService,
} from '../controllers/laundryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router
  .route('/')
  .get(getLaundryServices)
  .post(protect, admin, createLaundryService);

router
  .route('/:id')
  .get(getLaundryService)
  .put(protect, admin, updateLaundryService)
  .delete(protect, admin, deleteLaundryService);

export default router;
