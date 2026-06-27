import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Guest checkout is allowed; a logged-in user is attached when a token is present.
router.post('/', optionalAuth, createOrder);
router.get('/mine', protect, getMyOrders);

export default router;
