import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getLaundryServices } from '../services/laundryService.js';
import { getCleaningServices } from '../services/cleaningService.js';
import { getSettings } from '../services/settingsService.js';

/* ------------------------------------------------------------------ */
/*  The booking draft for the /book flow (blueprint §4.5).             */
/*  Separate from CartContext on purpose: the cart is the SHOP         */
/*  (pay in full); this draft is a SERVICE booking (estimate →         */
/*  deposit → invoice → balance). Persisted so a login round-trip      */
/*  or refresh doesn't lose the customer's work.                      */
/* ------------------------------------------------------------------ */

const BookingContext = createContext(null);
const STORAGE_KEY = 'bc_booking_draft';

const round2 = (n) => Math.round(n * 100) / 100;
// Prices are GST-inclusive; at 10% GST the tax component is total / 11.
const gstIncluded = (total) => round2(total / 11);

const EMPTY_DRAFT = {
  laundryQty: {}, // { [serviceId]: qty }
  cleaning: {
    serviceId: null,
    bedrooms: 2,
    bathrooms: 1,
    qty: 1, // for flat-priced cleaning types
    addons: {}, // { [serviceId]: qty }
  },
  pickupSlot: null,
  returnSlot: null,
  cleaningSlot: null,
  details: {
    line1: '',
    suburb: '',
    state: 'NSW',
    postcode: '',
    name: '',
    phone: '',
    accessNotes: '',
    specialInstructions: '',
  },
};

const loadDraft = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return EMPTY_DRAFT;
    return {
      ...EMPTY_DRAFT,
      ...saved,
      cleaning: { ...EMPTY_DRAFT.cleaning, ...(saved.cleaning || {}) },
      details: { ...EMPTY_DRAFT.details, ...(saved.details || {}) },
    };
  } catch {
    return EMPTY_DRAFT;
  }
};

export function BookingProvider({ children }) {
  const [draft, setDraft] = useState(loadDraft);

  // Catalogue + pricing knobs the estimate engine needs.
  const [laundryServices, setLaundryServices] = useState([]);
  const [cleaningServices, setCleaningServices] = useState([]);
  const [depositPercent, setDepositPercent] = useState(30);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setCatalogueLoading(true);
      setCatalogueError('');
      try {
        const [laundry, cleaning, settings] = await Promise.all([
          getLaundryServices(),
          getCleaningServices(),
          getSettings().catch(() => null),
        ]);
        if (!active) return;
        setLaundryServices(laundry.filter((s) => s.available !== false));
        setCleaningServices(cleaning.filter((s) => s.available !== false));
        if (settings && typeof settings.depositPercent === 'number') {
          setDepositPercent(settings.depositPercent);
        }
      } catch (err) {
        if (active) setCatalogueError(err.message || 'Could not load services');
      } finally {
        if (active) setCatalogueLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  /* ---- draft updates ---- */
  const setLaundryQty = (serviceId, qty) =>
    setDraft((d) => {
      const next = { ...d.laundryQty };
      if (qty > 0) next[serviceId] = qty;
      else delete next[serviceId];
      return { ...d, laundryQty: next };
    });

  const setCleaningService = (serviceId) =>
    setDraft((d) => ({ ...d, cleaning: { ...d.cleaning, serviceId } }));
  const setCleaningField = (field, value) =>
    setDraft((d) => ({ ...d, cleaning: { ...d.cleaning, [field]: value } }));
  const setAddonQty = (serviceId, qty) =>
    setDraft((d) => {
      const addons = { ...d.cleaning.addons };
      if (qty > 0) addons[serviceId] = qty;
      else delete addons[serviceId];
      return { ...d, cleaning: { ...d.cleaning, addons } };
    });

  const setPickupSlot = (slot) => setDraft((d) => ({ ...d, pickupSlot: slot }));
  const setReturnSlot = (slot) => setDraft((d) => ({ ...d, returnSlot: slot }));
  const setCleaningSlot = (slot) => setDraft((d) => ({ ...d, cleaningSlot: slot }));

  const setDetails = (patch) => setDraft((d) => ({ ...d, details: { ...d.details, ...patch } }));

  const reset = () => setDraft(EMPTY_DRAFT);

  /* ---- derived: estimate lines (mirrors the server's math) ---- */
  const laundryById = useMemo(
    () => new Map(laundryServices.map((s) => [s._id, s])),
    [laundryServices]
  );
  const cleaningById = useMemo(
    () => new Map(cleaningServices.map((s) => [s._id, s])),
    [cleaningServices]
  );

  const lines = useMemo(() => {
    const out = [];

    for (const [id, qty] of Object.entries(draft.laundryQty)) {
      const s = laundryById.get(id);
      if (!s || qty < 1) continue;
      out.push({
        kind: 'laundry',
        serviceId: id,
        label: s.name,
        unit: s.unit,
        qty,
        unitPrice: s.price,
        amount: round2(s.price * qty),
      });
    }

    const main = draft.cleaning.serviceId ? cleaningById.get(draft.cleaning.serviceId) : null;
    if (main) {
      if (main.pricingMode === 'home') {
        const beds = Math.max(1, draft.cleaning.bedrooms || 1);
        const baths = Math.max(1, draft.cleaning.bathrooms || 1);
        const amount = round2(
          main.price + (main.perBedroom || 0) * (beds - 1) + (main.perBathroom || 0) * (baths - 1)
        );
        out.push({
          kind: 'cleaning',
          serviceId: main._id,
          label: `${main.name} · ${beds} bed · ${baths} bath`,
          unit: main.unit,
          qty: 1,
          unitPrice: amount,
          amount,
        });
      } else {
        const qty = Math.max(1, draft.cleaning.qty || 1);
        out.push({
          kind: 'cleaning',
          serviceId: main._id,
          label: main.name,
          unit: main.unit,
          qty,
          unitPrice: main.price,
          amount: round2(main.price * qty),
        });
      }

      for (const [id, qty] of Object.entries(draft.cleaning.addons)) {
        const s = cleaningById.get(id);
        if (!s || qty < 1) continue;
        out.push({
          kind: 'addon',
          serviceId: id,
          label: s.name,
          unit: s.unit,
          qty,
          unitPrice: s.price,
          amount: round2(s.price * qty),
        });
      }
    }

    return out;
  }, [draft.laundryQty, draft.cleaning, laundryById, cleaningById]);

  const hasLaundry = useMemo(() => lines.some((l) => l.kind === 'laundry'), [lines]);
  const hasCleaning = useMemo(() => lines.some((l) => l.kind === 'cleaning'), [lines]);

  const estimatedTotal = useMemo(() => round2(lines.reduce((s, l) => s + l.amount, 0)), [lines]);
  const gstAmount = gstIncluded(estimatedTotal);
  const depositAmount = round2((estimatedTotal * depositPercent) / 100);
  const balancePreview = round2(estimatedTotal - depositAmount);

  const slotsReady =
    (!hasLaundry || (!!draft.pickupSlot && !!draft.returnSlot)) &&
    (!hasCleaning || !!draft.cleaningSlot);

  const detailsReady =
    draft.details.line1.trim().length > 0 &&
    draft.details.suburb.trim().length > 0 &&
    /^\d{4}$/.test(draft.details.postcode.trim()) &&
    draft.details.name.trim().length > 0 &&
    draft.details.phone.replace(/\D/g, '').length >= 8;

  /** The POST /api/bookings payload for the current draft. */
  const toPayload = () => ({
    laundry: Object.entries(draft.laundryQty)
      .filter(([id, qty]) => qty > 0 && laundryById.has(id))
      .map(([serviceId, qty]) => ({ serviceId, qty })),
    cleaning: draft.cleaning.serviceId
      ? {
          serviceId: draft.cleaning.serviceId,
          bedrooms: draft.cleaning.bedrooms,
          bathrooms: draft.cleaning.bathrooms,
          qty: draft.cleaning.qty,
          addons: Object.entries(draft.cleaning.addons).map(([serviceId, qty]) => ({
            serviceId,
            qty,
          })),
        }
      : null,
    pickupSlot: hasLaundry ? draft.pickupSlot : null,
    returnSlot: hasLaundry ? draft.returnSlot : null,
    cleaningSlot: hasCleaning ? draft.cleaningSlot : null,
    address: {
      line1: draft.details.line1,
      suburb: draft.details.suburb,
      state: draft.details.state,
      postcode: draft.details.postcode,
    },
    contact: { name: draft.details.name, phone: draft.details.phone },
    accessNotes: draft.details.accessNotes,
    specialInstructions: draft.details.specialInstructions,
  });

  const value = {
    draft,
    // catalogue
    laundryServices,
    cleaningServices,
    catalogueLoading,
    catalogueError,
    // updates
    setLaundryQty,
    setCleaningService,
    setCleaningField,
    setAddonQty,
    setPickupSlot,
    setReturnSlot,
    setCleaningSlot,
    setDetails,
    reset,
    // derived estimate
    lines,
    hasLaundry,
    hasCleaning,
    estimatedTotal,
    gstAmount,
    depositPercent,
    depositAmount,
    balancePreview,
    slotsReady,
    detailsReady,
    toPayload,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within a BookingProvider');
  return ctx;
}
