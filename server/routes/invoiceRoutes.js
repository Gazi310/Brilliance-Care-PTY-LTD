import { Router } from 'express';
import {
  getMyInvoices,
  getInvoiceById,
  payInvoiceBalance,
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Customer side of the invoicing loop (owner-or-admin checks in the controller).
router.get('/mine', protect, getMyInvoices);
router.get('/:id', protect, getInvoiceById);
router.post('/:id/pay', protect, payInvoiceBalance);

export default router;
