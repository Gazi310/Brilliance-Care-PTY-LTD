import { useEffect, useState } from 'react';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import DayStrip from '../../components/admin/schedule/DayStrip.jsx';
import SlotManager from '../../components/admin/schedule/SlotManager.jsx';
import JobRow from '../../components/admin/JobRow.jsx';
import { getAdminSchedule } from '../../services/adminService.js';
import { setDeliverySlot, setDeliveryDay } from '../../services/deliveryService.js';

/** Shift a 'YYYY-MM-DD' string by n days (local time). */
function shiftYMD(ymd, n) {
  const d = new Date(`${ymd}T00:00:00`);
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * /admin/schedule — the week at a glance (blueprint §5.4). Pick a day to see
 * every home visit due, and open/close its booking windows (which is what
 * the customer slot picker feeds off).
 */
export default function AdminSchedule() {
  const [start, setStart] = useState(''); // '' = week starting today
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const d = await getAdminSchedule({ start, days: 7 });
      setData(d);
      setSelected((cur) => (d.days.some((x) => x.date === cur) ? cur : d.days[0].date));
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  /** Run a slot mutation, then silently refresh the week. */
  const mutate = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const day = data?.days.find((d) => d.date === selected) || null;
  const isThisWeek = !start;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Admin"
        title="Schedule"
        subtitle="Every pickup, return, clean and delivery — and which windows customers can book."
      />

      {/* Week pager */}
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => data && setStart(shiftYMD(data.start, -7))}
          className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-soft transition hover:-translate-y-0.5"
        >
          ← Prev week
        </button>
        {!isThisWeek && (
          <button
            type="button"
            onClick={() => setStart('')}
            className="rounded-xl border border-aqua/50 bg-aqua/10 px-3 py-1.5 text-xs font-bold text-aqua-d shadow-soft transition hover:-translate-y-0.5"
          >
            Today
          </button>
        )}
        <button
          type="button"
          onClick={() => data && setStart(shiftYMD(data.start, 7))}
          className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-soft transition hover:-translate-y-0.5"
        >
          Next week →
        </button>
        {data && (
          <span className="ml-auto text-xs font-bold text-faint">
            {data.days[0].month} {data.days[0].dayNum} – {data.days[6].month}{' '}
            {data.days[6].dayNum}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          ⚠️ {error}
        </div>
      )}

      {loading || !data ? (
        <div className="space-y-3">
          <div className="bc-skeleton h-20 rounded-2xl" />
          <div className="bc-skeleton h-64 rounded-2xl" />
        </div>
      ) : (
        <>
          <DayStrip days={data.days} selected={selected} onSelect={setSelected} />

          {day && (
            <div className="mt-4 grid gap-3 lg:grid-cols-5">
              {/* Visits due on the selected day */}
              <section className="lg:col-span-3">
                <h3 className="text-sm font-extrabold text-ink">
                  Visits · {day.jobs.length}
                  <span className="ml-2 text-xs font-bold text-faint">
                    {day.weekday} {day.dayNum} {day.month}
                  </span>
                </h3>
                <div className="mt-2.5 space-y-2">
                  {day.jobs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-center">
                      <p className="text-2xl">📭</p>
                      <p className="mt-2 text-sm font-bold text-ink">No visits this day</p>
                      <p className="mt-1 text-xs text-muted">
                        Open a booking window so customers can book this day.
                      </p>
                    </div>
                  ) : (
                    day.jobs.map((j, i) => (
                      <JobRow key={`${j.orderId}-${j.window}-${i}`} job={j} />
                    ))
                  )}
                </div>
              </section>

              {/* Slot windows for the selected day (remounts per day) */}
              <div className="lg:col-span-2">
                <SlotManager
                  key={day.date}
                  day={day}
                  busy={busy}
                  onToggleWindow={(window, available, note) =>
                    mutate(() => setDeliverySlot(day.date, window, available, note))
                  }
                  onSaveNote={(window, available, note) =>
                    mutate(() => setDeliverySlot(day.date, window, available, note))
                  }
                  onSetDay={(available) => mutate(() => setDeliveryDay(day.date, available))}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
