import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDeliverySlots,
  setDeliverySlot,
  setDeliveryDay,
} from '../../services/deliveryService.js';

const WINDOW_ICON = { morning: '🌅', afternoon: '🌤️', evening: '🌙' };

const recount = (day) => ({
  ...day,
  availableCount: day.slots.filter((s) => s.available).length,
});

export default function DeliverySlotMenu({ isAdmin = false, selected = null, onSelect, notify }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null); // { today, windows, days }
  const [expanded, setExpanded] = useState(() => new Set());
  const [savingKey, setSavingKey] = useState(null);
  const wrapRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDeliverySlots(14);
      setData(res);
      // Open the first day that has availability (or just the first day).
      const firstOpen = res.days.find((d) => d.availableCount > 0) || res.days[0];
      setExpanded(new Set(firstOpen ? [firstOpen.date] : []));
    } catch (err) {
      setError(err.message || 'Could not load delivery slots');
    } finally {
      setLoading(false);
    }
  }, []);

  // Open/close. Fetching happens here (on user action) rather than in an effect.
  const toggleMenu = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
      load();
    }
  };

  // Close on outside-click and Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggleExpand = (date) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });

  // ---- customer: pick a slot ----
  const pick = (day, slot) => {
    onSelect?.({
      date: day.date,
      window: slot.window,
      label: slot.label,
      time: slot.time,
      weekday: day.weekday,
      dayNum: day.dayNum,
      month: day.month,
      dateLabel: `${day.weekday}, ${day.month} ${day.dayNum}`,
    });
    setOpen(false);
  };

  // ---- admin: optimistic local patches ----
  const patchSlot = (date, window, available) =>
    setData((d) =>
      !d ? d : {
        ...d,
        days: d.days.map((day) =>
          day.date !== date
            ? day
            : recount({ ...day, slots: day.slots.map((s) => (s.window === window ? { ...s, available } : s)) })
        ),
      }
    );

  const patchDay = (date, available) =>
    setData((d) =>
      !d ? d : {
        ...d,
        days: d.days.map((day) =>
          day.date !== date ? day : recount({ ...day, slots: day.slots.map((s) => ({ ...s, available })) })
        ),
      }
    );

  const toggleSlot = async (day, slot) => {
    const key = `${day.date}|${slot.window}`;
    const next = !slot.available;
    setSavingKey(key);
    patchSlot(day.date, slot.window, next); // optimistic
    try {
      await setDeliverySlot(day.date, slot.window, next);
    } catch (err) {
      notify?.(err.message, 'error');
      load(); // resync from server
    } finally {
      setSavingKey(null);
    }
  };

  const toggleWholeDay = async (day, available) => {
    setSavingKey(`day|${day.date}`);
    patchDay(day.date, available); // optimistic
    if (!expanded.has(day.date)) toggleExpand(day.date);
    try {
      await setDeliveryDay(day.date, available);
    } catch (err) {
      notify?.(err.message, 'error');
      load();
    } finally {
      setSavingKey(null);
    }
  };

  // ---- button label ----
  const buttonLabel = isAdmin
    ? 'Delivery availability'
    : selected
      ? `${selected.weekday} ${selected.month} ${selected.dayNum} · ${selected.label}`
      : 'Delivery slot';

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={toggleMenu}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-md transition hover:-translate-y-0.5 active:scale-95 ${
          selected && !isAdmin
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25'
            : 'border border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:text-violet-700'
        }`}
      >
        <span className="text-lg">🚚</span>
        <span className="max-w-[10rem] truncate">{buttonLabel}</span>
        {selected && !isAdmin ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(null);
            }}
            className="rounded-full px-1 text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label="Clear delivery slot"
          >
            ✕
          </span>
        ) : (
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div className="bc-fade-up absolute right-0 z-50 mt-2 w-[21rem] origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 sm:w-[23rem]">
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <span>🚚</span> {isAdmin ? 'Delivery availability' : 'Choose a delivery slot'}
              </p>
              <p className="text-[11px] text-white/80">
                {isAdmin ? 'Tap a window to open or close it for customers.' : 'Pick an available window for your delivery.'}
              </p>
            </div>
            <button
              onClick={load}
              title="Refresh"
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Refresh"
            >
              ⟳
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading && (
              <div className="space-y-2 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bc-skeleton h-12 rounded-xl" />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="m-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                ⚠️ {error}
                <button onClick={load} className="ml-2 rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold hover:bg-red-200">
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && data && (
              <ul className="space-y-1.5">
                {data.days.map((day) => {
                  const isOpenDay = expanded.has(day.date);
                  const hasSlots = day.availableCount > 0;
                  return (
                    <li key={day.date} className="overflow-hidden rounded-xl border border-gray-100">
                      {/* Day header */}
                      <button
                        onClick={() => toggleExpand(day.date)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-gray-50"
                      >
                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-gray-50 leading-none">
                          <span className="text-[10px] font-semibold uppercase text-gray-400">{day.weekday}</span>
                          <span className="text-base font-extrabold text-gray-800">{day.dayNum}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-gray-800">
                            {day.weekday}, {day.month} {day.dayNum}
                            {day.isToday && <span className="ml-1.5 text-[10px] font-bold text-violet-500">TODAY</span>}
                          </p>
                          <p className="text-xs">
                            {hasSlots ? (
                              <span className="font-semibold text-emerald-600">
                                {day.availableCount} slot{day.availableCount > 1 ? 's' : ''} available
                              </span>
                            ) : (
                              <span className="text-gray-400">Fully occupied</span>
                            )}
                          </p>
                        </div>
                        <svg
                          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpenDay ? 'rotate-180' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>

                      {/* Windows */}
                      {isOpenDay && (
                        <div className="space-y-1.5 border-t border-gray-100 bg-gray-50/60 p-2">
                          {isAdmin && (
                            <div className="flex gap-1.5 px-1 pb-1">
                              <button
                                onClick={() => toggleWholeDay(day, true)}
                                disabled={savingKey === `day|${day.date}`}
                                className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                              >
                                Open all
                              </button>
                              <button
                                onClick={() => toggleWholeDay(day, false)}
                                disabled={savingKey === `day|${day.date}`}
                                className="flex-1 rounded-lg bg-gray-100 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
                              >
                                Close all
                              </button>
                            </div>
                          )}

                          {day.slots.map((slot) => {
                            const isSel =
                              selected && selected.date === day.date && selected.window === slot.window;
                            const saving = savingKey === `${day.date}|${slot.window}`;
                            return (
                              <div
                                key={slot.window}
                                className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2 ${
                                  isSel ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-100'
                                }`}
                              >
                                <span className="text-lg">{WINDOW_ICON[slot.window]}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-gray-800">{slot.label}</p>
                                  <p className="text-[11px] text-gray-400">{slot.time}</p>
                                </div>

                                {isAdmin ? (
                                  <button
                                    type="button"
                                    onClick={() => toggleSlot(day, slot)}
                                    disabled={saving}
                                    className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-60 ${
                                      slot.available ? 'bg-emerald-500' : 'bg-gray-300'
                                    }`}
                                    aria-label={`Toggle ${slot.label}`}
                                    title={slot.available ? 'Available — click to occupy' : 'Occupied — click to open'}
                                  >
                                    <span
                                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                        slot.available ? 'left-[22px]' : 'left-0.5'
                                      }`}
                                    />
                                  </button>
                                ) : slot.available ? (
                                  <button
                                    onClick={() => pick(day, slot)}
                                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                                      isSel
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {isSel ? '✓ Selected' : 'Available'}
                                  </button>
                                ) : (
                                  <span className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-400">
                                    Occupied
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {!isAdmin && selected && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-emerald-50 px-4 py-2.5 text-xs">
              <span className="font-semibold text-emerald-700">
                ✓ {selected.dateLabel} · {selected.label} ({selected.time})
              </span>
              <button onClick={() => onSelect?.(null)} className="font-semibold text-emerald-600 hover:text-emerald-800">
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
