import { useEffect, useState } from 'react';
import { getLaundryServices } from '../services/laundryService';
import { getCleaningServices } from '../services/cleaningService';

/**
 * useCatalogue — the public laundry + cleaning price lists.
 *
 * /services and /pricing both publish prices, and those prices are the
 * admin-editable ones in the database rather than a copy pasted into the
 * markup. That's the whole point: when an admin changes "Wash & Fold" in
 * /admin/services, the marketing site changes with it. A hardcoded price
 * list goes stale the first time someone edits one and nobody notices.
 *
 * Memoised at module scope for the same reason `settingsService` is: a
 * page can mount three sections that each want the catalogue and there
 * should still be one request. A rejected fetch clears the memo so the
 * next mount retries — we cache the answer, not the failure.
 *
 * Returns `{ laundry, cleaning, loading, error }`. Callers are expected
 * to render something sensible when the lists are empty; nothing here is
 * load-bearing enough to justify blocking the page.
 */

let inflight = null;

export function loadCatalogue() {
  if (!inflight) {
    inflight = Promise.all([getLaundryServices(), getCleaningServices()])
      .then(([laundry, cleaning]) => ({
        laundry: Array.isArray(laundry) ? laundry : [],
        cleaning: Array.isArray(cleaning) ? cleaning : [],
      }))
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }
  return inflight;
}

/** Drop the memo — call after an admin edit if a public page is still mounted. */
export const invalidateCatalogue = () => {
  inflight = null;
};

export function useCatalogue() {
  const [state, setState] = useState({
    laundry: [],
    cleaning: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    let on = true;
    loadCatalogue()
      .then((data) => on && setState({ ...data, loading: false, error: '' }))
      .catch(
        (err) =>
          on &&
          setState({ laundry: [], cleaning: [], loading: false, error: err.message })
      );
    return () => {
      on = false;
    };
  }, []);

  return state;
}

/* ---------------- selectors ----------------
   The catalogue is one flat list per service line; these split it the
   way the price tables need. Kept here rather than in the pages so
   /services and /pricing can't disagree about what counts as an add-on. */

/** Only the services a customer can actually book right now. */
export const bookable = (list = []) => list.filter((s) => s.available !== false);

/** Cleaning priced on home size — the three main cleans. */
export const homeCleans = (cleaning = []) =>
  bookable(cleaning).filter((s) => s.pricingMode === 'home' && !s.isAddon);

/** Flat-priced cleaning — add-ons, commercial, anything per-visit or per-room. */
export const flatCleans = (cleaning = []) =>
  bookable(cleaning).filter((s) => s.pricingMode !== 'home' || s.isAddon);

/**
 * Cheapest price in a list, for a "from $X" line. Returns null on an
 * empty list so callers can fall back rather than print "from $0".
 */
export const cheapest = (list = []) => {
  const prices = bookable(list)
    .map((s) => Number(s.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : null;
};

/** Find a service by name, case-insensitively — used to price editorial rows. */
export const byName = (list = [], name = '') =>
  list.find((s) => String(s.name).trim().toLowerCase() === name.trim().toLowerCase()) || null;

export default useCatalogue;
