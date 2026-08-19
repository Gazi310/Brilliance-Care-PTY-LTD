import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getDeliverySlots,
  setDeliverySlot,
  setDeliveryDay,
} from '../../services/deliveryService.js';
import { resolveSlotAccent } from './slotAccents.js';
import {
  AlertIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
  SunriseIcon,
} from './icons.jsx';

/* ------------------------------------------------------------------ */
/*  A real (but tiny) month-grid calendar for picking a delivery /      */
/*  pickup window. Customers pick an available day, then a time window; */
/*  admins open/close days and windows. Self-fetches availability.      */
/*                                                                      */
/*  Kept as a month grid rather than the wireframe's flat 4-up slot     */
/*  buttons — the client asked for the calendar, and a restyle doesn't  */
/*  get to overrule that. Colour identity for the four uses lives in    */
/*  slotAccents.js; see the note there for why hue no longer carries it. */
/*                                                                      */
/*  THREE DAY STATES (laundry only — see server/utils/delivery.js):      */
/*    available    inside the booking window, admin opened a slot         */
/*    booked       inside the window, nothing open — reads as "full"      */
/*    unavailable  past the window — we aren't selling that day yet       */
/*  Shop and cleaning have no booking window, so they only ever produce   */
/*  available / unavailable: exactly the two-state calendar as before.    */
/*                                                                       */
/*  Status is recomputed locally rather than read straight off the day,   */
/*  because the admin toggles patch `availableCount` optimistically and   */
/*  the cell has to follow without waiting for a refetch.                 */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WINDOW_ICON = { morning: SunriseIcon, afternoon: SunIcon, evening: MoonIcon };

const pad = (n) => String(n).padStart(2, '0');
const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYMD = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const recount = (day) => ({ ...day, availableCount: day.slots.filter((s) => s.available).length });

/** Day-level status. `win` is { uses, end } from the payload. */
const dayStatus = (day, win) => {
  if (!win.uses) return day.availableCount > 0 ? 'available' : 'unavailable';
  if (win.end && day.date > win.end) return 'unavailable';
  return day.availableCount > 0 ? 'available' : 'booked';
};

/** Same rule at window level, so a single closed slot reads the same way. */
const windowStatus = (day, slot, win) => {
  if (!win.uses) return slot.available ? 'available' : 'unavailable';
  if (win.end && day.date > win.end) return 'unavailable';
  return slot.available ? 'available' : 'booked';
};

/* How each state paints. `unavailable` recedes hardest — a customer scanning
   the grid should see the bookable days first and only then ask why the rest
   aren't. Booked keeps the red family so "full" and "not yet" never blur. */
const DAY_TONE = {
  available: 'text-ink hover:bg-sky-50',
  booked: 'cursor-not-allowed text-bad/70',
  unavailable: 'cursor-not-allowed text-line',
};

const DAY_TITLE = {
  available: (n) => `${n} slot${n > 1 ? 's' : ''} open`,
  booked: () => 'Fully booked',
  unavailable: () => 'Not available yet',
};

export default function SlotCalendar({
  isAdmin = false,
  value = null,
  onChange,
  notify,
  daysAhead = 45,
  accent = 'cleaning',
  scope = 'shop',
}) {
  const a = resolveSlotAccent(accent);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null); // { today, windows, days }
  const [savingKey, setSavingKey] = useState(null);

  // Which day is expanded into its time windows.
  const [activeDate, setActiveDate] = useState(value?.date || null);
  // Which month the grid is showing.
  const [view, setView] = useState(() => {
    const base = value?.date ? parseYMD(value.date) : new Date();
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDeliverySlots(daysAhead, scope);
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load availability');
    } finally {
      setLoading(false);
    }
  }, [daysAhead, scope]);

  useEffect(() => {
    load();
  }, [load]);

  // Index days by date, and find the bookable range (today .. last fetched day).
  const byDate = useMemo(() => {
    const map = new Map();
    if (data) for (const d of data.days) map.set(d.date, d);
    return map;
  }, [data]);

  const range = useMemo(() => {
    if (!data || !data.days.length) return null;
    return { min: data.days[0].date, max: data.days[data.days.length - 1].date };
  }, [data]);

  // The booking window, as the payload reports it. Scopes without one leave
  // `uses` false and every rule below collapses back to the old two states.
  const win = useMemo(
    () => ({
      uses: Boolean(data?.usesBookingWindow),
      end: data?.bookingWindowEnd || null,
      days: data?.bookingWindowDays || null,
    }),
    [data]
  );

  // Month-navigation bounds.
  const bounds = useMemo(() => {
    if (!range) return null;
    const min = parseYMD(range.min);
    const max = parseYMD(range.max);
    return {
      minIdx: min.getFullYear() * 12 + min.getMonth(),
      maxIdx: max.getFullYear() * 12 + max.getMonth(),
    };
  }, [range]);

  const viewIdx = view.y * 12 + view.m;
  const canPrev = bounds && viewIdx > bounds.minIdx;
  const canNext = bounds && viewIdx < bounds.maxIdx;
  const step = (delta) =>
    setView(({ y, m }) => {
      const idx = y * 12 + m + delta;
      return { y: Math.floor(idx / 12), m: ((idx % 12) + 12) % 12 };
    });

  // Build the 6-week grid for the visible month.
  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const lead = first.getDay();
    const total = new Date(view.y, view.m + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < lead; i += 1) out.push(null);
    for (let d = 1; d <= total; d += 1) {
      const date = new Date(view.y, view.m, d);
      const ymd = toYMD(date);
      const meta = byDate.get(ymd);
      out.push({ d, ymd, meta });
    }
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [view, byDate]);

  const activeDay = activeDate ? byDate.get(activeDate) : null;

  /* ---- customer: pick a window ---- */
  const pick = (day, slot) => {
    onChange?.({
      date: day.date,
      window: slot.window,
      label: slot.label,
      time: slot.time,
      weekday: day.weekday,
      dayNum: day.dayNum,
      month: day.month,
      dateLabel: `${day.weekday}, ${day.month} ${day.dayNum}`,
    });
  };

  /* ---- admin: optimistic availability patches ---- */
  const patchSlot = (date, window, available) =>
    setData((cur) =>
      !cur ? cur : {
        ...cur,
        days: cur.days.map((day) =>
          day.date !== date ? day : recount({ ...day, slots: day.slots.map((s) => (s.window === window ? { ...s, available } : s)) })
        ),
      }
    );
  const patchDay = (date, available) =>
    setData((cur) =>
      !cur ? cur : {
        ...cur,
        days: cur.days.map((day) =>
          day.date !== date ? day : recount({ ...day, slots: day.slots.map((s) => ({ ...s, available })) })
        ),
      }
    );

  const toggleSlot = async (day, slot) => {
    const key = `${day.date}|${slot.window}`;
    const next = !slot.available;
    setSavingKey(key);
    patchSlot(day.date, slot.window, next);
    try {
      await setDeliverySlot(day.date, slot.window, next, '', scope);
    } catch (err) {
      notify?.(err.message, 'error');
      load();
    } finally {
      setSavingKey(null);
    }
  };
  const toggleWholeDay = async (day, available) => {
    setSavingKey(`day|${day.date}`);
    patchDay(day.date, available);
    try {
      await setDeliveryDay(day.date, available, scope);
    } catch (err) {
      notify?.(err.message, 'error');
      load();
    } finally {
      setSavingKey(null);
    }
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="w-full select-none">
      {/* Month header */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!canPrev}
          className="grid h-8 w-8 place-items-center rounded-btn text-navy-500 transition hover:bg-sky-50 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Previous month"
        >
          <ChevronLeftIcon width={16} height={16} aria-hidden="true" />
        </button>
        <p className="font-display text-[15px] font-bold text-navy-900">
          {MONTHS[view.m]} {view.y}
        </p>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={!canNext}
          className="grid h-8 w-8 place-items-center rounded-btn text-navy-500 transition hover:bg-sky-50 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRightIcon width={16} height={16} aria-hidden="true" />
        </button>
      </div>

      {loading && <div className="bc-skeleton h-56 rounded-card" />}

      {!loading && error && (
        <div className="flex items-start gap-3 rounded-card bg-bad-bg px-4 py-3 text-sm text-bad">
          <AlertIcon width={18} height={18} className="mt-0.5 flex-none" aria-hidden="true" />
          <p className="min-w-0">
            {error}
            <button
              onClick={load}
              className="ml-2 rounded-btn bg-white px-2.5 py-1 text-xs font-bold text-bad transition hover:bg-white/70"
            >
              Retry
            </button>
          </p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Weekday row */}
          <div className="mb-1.5 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                {w}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, i) => {
              if (!cell) return <div key={`b${i}`} />;
              const { d, ymd, meta } = cell;
              const inRange = Boolean(meta);
              const openCount = meta?.availableCount || 0;
              const status = inRange ? dayStatus(meta, win) : 'unavailable';
              const isToday = meta?.isToday;
              const isActive = ymd === activeDate;
              const isPicked = value?.date === ymd;
              // Customers can only open bookable days. Admins get every day in
              // range — including ones past the booking window, so a fortnight
              // can be rostered ahead and go live as the window rolls onto it.
              const clickable = inRange && (isAdmin || status === 'available');
              // Admin-only: opened, but customers can't see it yet.
              const queued = isAdmin && status === 'unavailable' && openCount > 0;

              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={!clickable}
                  onClick={() => setActiveDate(ymd)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-btn text-sm font-semibold transition ${
                    // Gold = the committed choice. Navy = the day you're
                    // looking at. Same meaning as Stepper's current/done.
                    isPicked
                      ? 'bg-gold-500 text-navy-900 shadow-card'
                      : isActive
                        ? 'bg-navy-900 text-white'
                        : isAdmin
                          ? 'text-ink hover:bg-sky-50'
                          : DAY_TONE[status]
                  } ${isToday && !(isActive || isPicked) ? `ring-1 ring-inset ${a.ring}` : ''} ${
                    queued ? 'border border-dashed border-navy-500/50' : ''
                  }`}
                  title={
                    !inRange
                      ? 'Not available'
                      : isAdmin
                        ? `${openCount} of ${meta.slots.length} open${status === 'unavailable' ? ' · past the booking window' : ''} — click to manage`
                        : DAY_TITLE[status](openCount)
                  }
                >
                  <span>{d}</span>
                  {/* Availability marker — shape and weight carry the accent.
                      Deliberately keyed off `status`, not `openCount`: a day
                      an admin pre-opened past the booking window is NOT live,
                      and must not wear the same dot as a bookable one. Admins
                      still see their own rostering (last branch). */}
                  {inRange && (
                    <span
                      className={`absolute bottom-1 rounded-full ${
                        isPicked
                          ? 'h-1.5 w-1.5 bg-navy-900/45'
                          : isActive
                            ? 'h-1.5 w-1.5 bg-white/70'
                            : status === 'available'
                              ? a.dot
                              : status === 'booked'
                                ? 'h-[3px] w-3 bg-bad/50'
                                : isAdmin
                                  ? openCount > 0
                                    ? a.dot
                                    : 'h-1.5 w-1.5 bg-line'
                                  : 'h-1.5 w-1.5 bg-transparent'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend — three states need naming; two never did. */}
          {win.uses && (
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className={`inline-block rounded-full ${a.dot}`} />
                Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-[3px] w-3 rounded-full bg-bad/50" />
                Booked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-line" />
                {win.days ? `Beyond ${win.days} days` : 'Not open yet'}
              </span>
            </div>
          )}

          {/* Time windows for the selected day */}
          <div className="mt-4 border-t border-line pt-4">
            {!activeDay ? (
              <p className="py-3 text-center text-[13px] text-muted">
                {isAdmin ? 'Pick a day to open or close its time windows.' : 'Pick an available day to choose a time.'}
              </p>
            ) : (
              <>
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-navy-900">
                    {activeDay.weekday}, {activeDay.month} {activeDay.dayNum}
                    {activeDay.isToday && (
                      <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] text-navy-900">
                        TODAY
                      </span>
                    )}
                  </p>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggleWholeDay(activeDay, true)}
                        disabled={savingKey === `day|${activeDay.date}`}
                        className="rounded-btn bg-ok-bg px-2.5 py-1 text-[11px] font-bold text-ok transition hover:bg-ok-bg/70 disabled:opacity-50"
                      >
                        Open all
                      </button>
                      <button
                        onClick={() => toggleWholeDay(activeDay, false)}
                        disabled={savingKey === `day|${activeDay.date}`}
                        className="rounded-btn bg-line px-2.5 py-1 text-[11px] font-bold text-muted transition hover:bg-line/70 disabled:opacity-50"
                      >
                        Close all
                      </button>
                    </div>
                  )}
                </div>

                {/* Admins can roster past the window; say so rather than let
                    an opened day look live when customers can't see it. */}
                {isAdmin && win.uses && win.end && activeDay.date > win.end && (
                  <p className="mb-2.5 rounded-btn bg-warn-bg px-3 py-2 text-[11px] font-semibold leading-snug text-warn">
                    Past the {win.days}-day booking window — customers can&apos;t book this day yet.
                    Anything you open here goes live automatically once the window reaches it.
                  </p>
                )}

                <div className="space-y-2">
                  {activeDay.slots.map((slot) => {
                    const isSel = value?.date === activeDay.date && value?.window === slot.window;
                    const saving = savingKey === `${activeDay.date}|${slot.window}`;
                    const Icon = WINDOW_ICON[slot.window];
                    const slotState = windowStatus(activeDay, slot, win);
                    return (
                      <div
                        key={slot.window}
                        className={`flex items-center gap-3 rounded-btn border px-3 py-2.5 ${
                          isSel ? 'border-gold-500 bg-gold-100/50' : 'border-line bg-white'
                        }`}
                      >
                        {Icon && <Icon width={18} height={18} className="flex-none text-navy-500" aria-hidden="true" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-navy-900">{slot.label}</p>
                          <p className="text-[11px] text-muted">{slot.time}</p>
                        </div>

                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => toggleSlot(activeDay, slot)}
                            disabled={saving}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60 ${slot.available ? 'bg-ok' : 'bg-muted/40'}`}
                            aria-label={`Toggle ${slot.label}`}
                            title={
                              slot.available
                                ? 'Open — click to close'
                                : slotState === 'booked'
                                  ? 'Closed — customers see this as "Booked". Click to open'
                                  : 'Closed — click to open'
                            }
                          >
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${slot.available ? 'left-[22px]' : 'left-0.5'}`} />
                          </button>
                        ) : slot.available ? (
                          <button
                            onClick={() => pick(activeDay, slot)}
                            className={`shrink-0 rounded-btn px-3.5 py-2 text-xs font-bold transition active:scale-95 ${
                              isSel
                                ? 'bg-gold-500 text-navy-900'
                                : 'bg-sky-100 text-navy-900 hover:bg-sky-100/70'
                            }`}
                          >
                            {isSel ? 'Selected' : 'Choose'}
                          </button>
                        ) : slotState === 'booked' ? (
                          <span className="shrink-0 rounded-btn bg-bad-bg px-3.5 py-2 text-xs font-bold text-bad">
                            Booked
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-btn bg-line px-3.5 py-2 text-xs font-bold text-muted">
                            Unavailable
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
