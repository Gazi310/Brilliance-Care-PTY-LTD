import { api } from './api.js';

/**
 * Public store settings — delivery fee, GST flag, service postcodes and
 * the business details the shell renders.
 *
 * The read is memoised at module scope. The footer, the homepage's two
 * postcode checks and the closing CTA all want the same object on the
 * same page load; without this that's four identical requests before
 * the page has finished painting.
 *
 * A rejected request clears the memo so the next mount can retry — we
 * cache the answer, not the failure.
 */

let inflight = null;

export const getSettings = () => {
  if (!inflight) {
    inflight = api.get('/settings').catch((err) => {
      inflight = null;
      throw err;
    });
  }
  return inflight;
};

/** Drop the memo so the next read goes to the server. */
export const invalidateSettings = () => {
  inflight = null;
};

// Admin-only: update settings. Busts the memo, so the footer and any
// other shell surface pick the change up without a page reload.
export const updateSettings = async (fields) => {
  const updated = await api.put('/settings', fields, true);
  invalidateSettings();
  return updated;
};
