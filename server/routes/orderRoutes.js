import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js';
import {
  listOrders,
  updateOrderStatus,
  assessOrder,
  createInvoice,
  recordBalancePayment,
} from '../controllers/adminOrderController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Guest checkout is allowed; a logged-in user is attached when a token is present.
router.post('/', optionalAuth, createOrder);
router.get('/mine', protect, getMyOrders);

// ---- Admin work queue + the Phase 2 assess → invoice → balance loop ----
router.get('/', protect, admin, listOrders);
router.patch('/:id/status', protect, admin, updateOrderStatus);
router.post('/:id/assess', protect, admin, assessOrder);
router.post('/:id/invoice', protect, admin, createInvoice);
router.post('/:id/record-balance', protect, admin, recordBalancePayment);

router.get('/:id', protect, getOrderById);

export default router;
