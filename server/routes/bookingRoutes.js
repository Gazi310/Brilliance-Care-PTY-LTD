import { Router } from 'express';
import { createBooking, payDeposit } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Service bookings require an account (deposit → invoice → balance loop).
router.post('/', protect, createBooking);
router.post('/:id/pay-deposit', protect, payDeposit);

export default router;
