// Shared delivery-slot definitions and date helpers used by the controller and seed.

// The three bookable windows in a delivery day. `key` is stored on records,
// `label`/`time` are snapshotted onto orders and shown in the UI.
export const DELIVERY_WINDOWS = [
  { key: 'morning', label: 'Morning', time: '9:00 – 12:00' },
  { key: 'afternoon', label: 'Afternoon', time: '12:00 – 16:00' },
  { key: 'evening', label: 'Evening', time: '16:00 – 20:00' },
];

export const WINDOW_KEYS = DELIVERY_WINDOWS.map((w) => w.key);

export const getWindowDef = (key) => DELIVERY_WINDOWS.find((w) => w.key === key) || null;

// Each service line keeps its OWN independent availability calendar ("scope"):
//   shop     → product delivery windows
//   laundry  → laundry pickup / return windows
//   cleaning → cleaning appointment windows
// A (scope, date, window) triple is the unique key for one bookable slot.
export const DELIVERY_SCOPES = ['shop', 'laundry', 'cleaning'];
export const DEFAULT_SCOPE = 'shop';
export const isValidScope = (s) => DELIVERY_SCOPES.includes(s);
// Fall back to the shop calendar for missing/unknown scopes (keeps legacy
// callers that never pass a scope working exactly as before).
export const normalizeScope = (s) => (isValidScope(s) ? s : DEFAULT_SCOPE);

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Local-time 'YYYY-MM-DD' (avoids the UTC shift you get from date.toISOString()).
export function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const isValidYMD = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

// Parse 'YYYY-MM-DD' into a LOCAL-midnight Date (new Date(s) would give UTC).
export function parseYMD(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Midnight local time, today + offset days.
export function dayFromToday(offset = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

// Display metadata derived straight from a Date object (no string re-parsing).
export function dayMeta(date) {
  return {
    date: toYMD(date),
    weekday: WEEKDAYS[date.getDay()],
    dayNum: date.getDate(),
    month: MONTHS[date.getMonth()],
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
  };
}

/* ------------------------------------------------------------------ */
/*  THE BOOKING WINDOW (the "horizon")                                  */
/*                                                                      */
/*  Laundry only takes bookings a fixed number of days out — the crew    */
/*  is rostered a fortnight at a time, so a day beyond that isn't a      */
/*  "no", it's a "not yet". That distinction is what gives the calendar  */
/*  three states instead of two:                                        */
/*                                                                      */
/*    available    inside the window, admin opened at least one slot      */
/*    booked       inside the window, nothing open (full or closed)       */
/*    unavailable  outside the window — not taking that day yet           */
/*                                                                      */
/*  Only the scopes listed below are gated. Shop and cleaning keep the    */
/*  original two-state behaviour (open vs not), so switching one of them  */
/*  over later is a one-line change here and nothing else.                */
/* ------------------------------------------------------------------ */
export const HORIZON_SCOPES = ['laundry'];
export const scopeUsesHorizon = (s) => HORIZON_SCOPES.includes(normalizeScope(s));

export const DEFAULT_BOOKING_WINDOW_DAYS = 14; // two weeks, counting today
export const MIN_BOOKING_WINDOW_DAYS = 1;
export const MAX_BOOKING_WINDOW_DAYS = 60;

/** Coerce anything into a usable whole-day booking window. */
export function clampBookingWindowDays(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return DEFAULT_BOOKING_WINDOW_DAYS;
  return Math.min(MAX_BOOKING_WINDOW_DAYS, Math.max(MIN_BOOKING_WINDOW_DAYS, v));
}

/**
 * Last date a customer may book, inclusive. A window of 14 means today plus
 * the next 13 days — a fortnight of bookable days, counting today as day one.
 */
export const horizonEndDate = (windowDays) =>
  toYMD(dayFromToday(clampBookingWindowDays(windowDays) - 1));

/** Is this 'YYYY-MM-DD' inside the window? (Lexical compare is safe on YMD.) */
export const isWithinHorizon = (date, windowDays) =>
  date >= toYMD(dayFromToday(0)) && date <= horizonEndDate(windowDays);

/**
 * The one place that decides what a day or window looks like to a customer.
 * `open` is whether an admin opened it; everything else is the horizon rule.
 */
export function slotStatus({ date, open, scope, windowDays }) {
  if (!scopeUsesHorizon(scope)) return open ? 'available' : 'unavailable';
  if (!isWithinHorizon(date, windowDays)) return 'unavailable';
  return open ? 'available' : 'booked';
}
