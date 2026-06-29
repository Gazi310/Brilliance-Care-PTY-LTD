import { Router } from 'express';
import { getSlots, setSlot, setDay } from '../controllers/deliveryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

// Public: customers read the rolling availability calendar.
router.get('/', getSlots);

// Admin: open/close a whole day, or a single window.
router.put('/day', protect, admin, setDay);
router.put('/', protect, admin, setSlot);

export default router;
