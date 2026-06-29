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
