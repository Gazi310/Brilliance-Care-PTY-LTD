import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  setStock,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Quick stock / availability update used by the admin inventory panel.
router.patch('/:id/stock', protect, admin, setStock);

export default router;
