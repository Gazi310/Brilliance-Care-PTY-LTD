import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
// Raised limit so admins can upload product photos (stored as data URLs).
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'brilliance-care-api', time: new Date().toISOString() })
);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-slots', deliveryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
