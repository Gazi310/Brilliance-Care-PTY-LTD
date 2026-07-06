import asyncHandler from '../utils/asyncHandler.js';
import Invoice from '../models/Invoice.js';
import Order from '../models/Order.js';
import { chargeBalance } from '../utils/payments.js';
import { maybeFinalize } from './adminOrderController.js';

/** Owner-or-admin guard shared by the customer invoice endpoints. */
function assertCanView(res, invoice, user) {
  const isOwner = invoice.user && invoice.user.toString() === user._id.toString();
  if (!isOwner && !user.isAdmin) {
    res.status(403);
    throw new Error('This invoice belongs to another account');
  }
}

// GET /api/invoices/mine  (protected)
export const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user._id, status: { $ne: 'void' } })
    .sort({ createdAt: -1 })
    .populate('order', 'orderNumber service status');
  res.json(invoices);
});

// GET /api/invoices/:id  (protected — owner or admin)
export const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate(
    'order',
    'orderNumber service status kind depositPercent depositAmount depositStatus estimatedTotal address contact laundryReturnSlot cleaningSlot'
  );
  if (!invoice || invoice.status === 'void') {
    res.status(404);
    throw new Error('Invoice not found');
  }
  assertCanView(res, invoice, req.user);
  res.json(invoice);
});

/**
 * POST /api/invoices/:id/pay  (protected — owner or admin)
 * Pay the remaining balance by card (mock provider — same test rules as the
 * deposit: any card works, numbers ending 0002 decline).
 */
export const payInvoiceBalance = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice || invoice.status === 'void') {
    res.status(404);
    throw new Error('Invoice not found');
  }
  assertCanView(res, invoice, req.user);

  if (invoice.status === 'paid') {
    res.status(409);
    throw new Error('This invoice is already settled');
  }
  if (invoice.balanceDue <= 0) {
    res.status(409);
    throw new Error('There is no balance to pay on this invoice');
  }

  const order = await Order.findById(invoice.order);
  if (!order) {
    res.status(404);
    throw new Error('The order for this invoice no longer exists');
  }

  let payment;
  try {
    payment = await chargeBalance(order, invoice, req.body.card || {});
  } catch (err) {
    res.status(err.statusCode || 402);
    throw err;
  }

  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoice.paymentMethod = 'card_online';
  invoice.balancePaymentId = payment.id;

  order.balanceStatus = 'paid';
  order.balancePaymentId = payment.id;
  maybeFinalize(order);

  await invoice.save();
  await order.save();

  res.json({ invoice, order });
});
