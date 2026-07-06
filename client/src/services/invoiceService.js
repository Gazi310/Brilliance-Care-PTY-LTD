import { api } from './api.js';

/** Fetch one invoice (owner or admin) — order summary comes populated. */
export const getInvoice = (invoiceId) => api.get(`/invoices/${invoiceId}`, true);

/** The signed-in user's invoices, newest first. */
export const getMyInvoices = () => api.get('/invoices/mine', true);

/**
 * Pay the remaining balance by card. Mock provider for now — same test rules
 * as the deposit (any card works; a number ending in 0002 declines), and the
 * swap to a real gateway is contained to the server's utils/payments.js.
 */
export const payInvoiceBalance = (invoiceId, card) =>
  api.post(`/invoices/${invoiceId}/pay`, { card }, true);
