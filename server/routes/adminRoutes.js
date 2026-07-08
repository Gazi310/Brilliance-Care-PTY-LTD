import { Router } from 'express';
import { getAdminStats, getAdminSchedule } from '../controllers/adminStatsController.js';
import {
  listCustomers,
  getCustomer,
  setCustomerNote,
} from '../controllers/adminCustomerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

/** Phase 3 admin-ops endpoints — everything here is admin-only. */
const router = Router();
router.use(protect, admin);

router.get('/stats', getAdminStats); // dashboard morning glance
router.get('/schedule', getAdminSchedule); // day-by-day jobs + slot windows

router.get('/customers', listCustomers);
router.get('/customers/:id', getCustomer);
router.put('/customers/:id/note', setCustomerNote);

export default router;
