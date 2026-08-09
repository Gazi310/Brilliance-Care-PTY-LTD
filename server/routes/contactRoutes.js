import { Router } from 'express';
import {
  createMessage,
  listMessages,
  setMessageStatus,
} from '../controllers/contactController.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';

/**
 * /api/contact — public write, admin read.
 *
 * The POST is intentionally open: most enquiries come from people who
 * haven't (and won't) create an account. Validation and the honeypot live
 * in the controller.
 *
 * `optionalAuth` never blocks the request — it just links the enquiry to
 * an account when the sender happens to be signed in, which is how an
 * admin can see "this is the customer with the open invoice".
 */
const router = Router();

router.post('/', optionalAuth, createMessage);

router.get('/', protect, admin, listMessages);
router.patch('/:id', protect, admin, setMessageStatus);

export default router;
