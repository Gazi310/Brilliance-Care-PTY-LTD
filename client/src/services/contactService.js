import { api } from './api.js';

/**
 * Public contact form + the admin inbox.
 *
 * `company` in the payload is the honeypot: the form renders it hidden and
 * a real person never fills it. Always send it, even empty — the server
 * checks presence of content, not presence of the key.
 */
export const sendContactMessage = (fields) => api.post('/contact', fields);

/** Admin: the enquiry inbox. `status` filters to new | read | closed. */
export const adminListMessages = (status = '') =>
  api.get(`/contact${status ? `?status=${encodeURIComponent(status)}` : ''}`, true);

/** Admin: move an enquiry through new → read → closed. */
export const adminSetMessageStatus = (id, status) =>
  api.patch(`/contact/${id}`, { status }, true);
