import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getDeliverySlots,
  setDeliverySlot,
  setDeliveryDay,
} from '../../services/deliveryService.js';

/* ------------------------------------------------------------------ */
/*  A real (but tiny) month-grid calendar for picking a delivery /      */
/*  pickup window. Customers pick an available day, then a time window; */
/*  admins open/close days and windows. Self-fetches availability.      */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WINDOW_ICON = { morning: '🌅', afternoon: '🌤️', evening: '🌙' };

// Per-use colour accents (full literal class strings so Tailwind keeps them).
const ACCENTS = {
  emerald: { fill: 'bg-emerald-500 text-white shadow-emerald-500/30', dot: 'bg-emerald-500', ring: 'ring-emerald-400', pill: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', pillSel: 'bg-emerald-500 text-white', head: 'from-emerald-500 to-teal-600' },
  sky: { fill: 'bg-sky-500 text-white shadow-sky-500/30', dot: 'bg-sky-500', ring: 'ring-sky-400', pill: 'bg-sky-50 text-sky-700 hover:bg-sky-100', pillSel: 'bg-sky-500 text-white', head: 'from-sky-500 to-blue-600' },
  amber: { fill: 'bg-amber-500 text-white shadow-amber-500/30', dot: 'bg-amber-500', ring: 'ring-amber-400', pill: 'bg-amber-50 text-amber-700 hover:bg-amber-100', pillSel: 'bg-amber-500 text-white', head: 'from-amber-500 to-orange-600' },
  violet: { fill: 'bg-violet-600 text-white shadow-violet-500/30', dot: 'bg-violet-500', ring: 'ring-violet-400', pill: 'bg-violet-50 text-violet-700 hover:bg-violet-100', pillSel: 'bg-violet-600 text-white', head: 'from-violet-600 to-fuchsia-600' },
};

const pad = (n) => String(n).padStart(2, '0');
const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYMD = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const recount = (day) => ({ ...day, availableCount: day.slots.filter((s) => s.available).length });

export default function SlotCalendar({
  isAdmin = false,
  value = null,
  onChange,
  notify,
  daysAhead = 45,
  accent = 'emerald',
}) {
  const a = ACCENTS[accent] || ACCENTS.emerald;

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
      const res = await getDeliverySlots(daysAhead);
      setData(res);
    } catch (err) {
      setError(err.message || 'Could not load availability');
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

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
      await setDeliverySlot(day.date, slot.window, next);
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
      await setDeliveryDay(day.date, available);
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
      <div className="mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!canPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="text-sm font-bold text-gray-800">
          {MONTHS[view.m]} {view.y}
        </p>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={!canNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 disabled:opacity-30"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {loading && <div className="bc-skeleton h-56 rounded-xl" />}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
          ⚠️ {error}
          <button onClick={load} className="ml-2 rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold hover:bg-red-200">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Weekday row */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">
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
              const isToday = meta?.isToday;
              const isActive = ymd === activeDate;
              const isPicked = value?.date === ymd;
              // Customers can only open days that have availability; admins, any in-range day.
              const clickable = inRange && (isAdmin || openCount > 0);

              return (
                <button
                  key={ymd}
                  type="button"
                  disabled={!clickable}
                  onClick={() => setActiveDate(ymd)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-semibold transition ${
                    isActive || isPicked
                      ? a.fill + ' shadow-md'
                      : clickable
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'cursor-not-allowed text-gray-300'
                  } ${isToday && !(isActive || isPicked) ? `ring-1 ${a.ring}` : ''}`}
                  title={
                    !inRange ? 'Not available' : openCount > 0 ? `${openCount} slot${openCount > 1 ? 's' : ''} open` : isAdmin ? 'Closed — click to manage' : 'Fully booked'
                  }
                >
                  <span>{d}</span>
                  {/* availability dot */}
                  {inRange && (
                    <span
                      className={`absolute bottom-1 h-1 w-1 rounded-full ${
                        isActive || isPicked
                          ? 'bg-white/80'
                          : openCount > 0
                            ? a.dot
                            : isAdmin
                              ? 'bg-gray-300'
                              : 'bg-transparent'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time windows for the selected day */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            {!activeDay ? (
              <p className="py-3 text-center text-xs text-gray-400">
                {isAdmin ? 'Pick a day to open or close its time windows.' : 'Pick an available day to choose a time.'}
              </p>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-700">
                    {activeDay.weekday}, {activeDay.month} {activeDay.dayNum}
                    {activeDay.isToday && <span className="ml-1.5 text-[10px] font-bold text-violet-500">TODAY</span>}
                  </p>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggleWholeDay(activeDay, true)}
                        disabled={savingKey === `day|${activeDay.date}`}
                        className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                      >
                        Open all
                      </button>
                      <button
                        onClick={() => toggleWholeDay(activeDay, false)}
                        disabled={savingKey === `day|${activeDay.date}`}
                        className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
                      >
                        Close all
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  {activeDay.slots.map((slot) => {
                    const isSel = value?.date === activeDay.date && value?.window === slot.window;
                    const saving = savingKey === `${activeDay.date}|${slot.window}`;
                    return (
                      <div
                        key={slot.window}
                        className={`flex items-center gap-2.5 rounded-lg border bg-white px-2.5 py-2 ${
                          isSel ? `${a.ring} ring-1` : 'border-gray-100'
                        }`}
                      >
                        <span className="text-base">{WINDOW_ICON[slot.window]}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-800">{slot.label}</p>
                          <p className="text-[10px] text-gray-400">{slot.time}</p>
                        </div>

                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => toggleSlot(activeDay, slot)}
                            disabled={saving}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60 ${slot.available ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            aria-label={`Toggle ${slot.label}`}
                            title={slot.available ? 'Open — click to close' : 'Closed — click to open'}
                          >
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${slot.available ? 'left-[22px]' : 'left-0.5'}`} />
                          </button>
                        ) : slot.available ? (
                          <button
                            onClick={() => pick(activeDay, slot)}
                            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition active:scale-95 ${isSel ? a.pillSel : a.pill}`}
                          >
                            {isSel ? '✓ Selected' : 'Choose'}
                          </button>
                        ) : (
                          <span className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-400">Closed</span>
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
