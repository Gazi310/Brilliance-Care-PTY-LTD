import { useEffect, useState } from 'react';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import DayStrip from '../../components/admin/schedule/DayStrip.jsx';
import SlotManager from '../../components/admin/schedule/SlotManager.jsx';
import JobRow from '../../components/admin/JobRow.jsx';
import { getAdminSchedule } from '../../services/adminService.js';
import { setDeliverySlot, setDeliveryDay } from '../../services/deliveryService.js';
import { AlertIcon } from '../../components/admin/icons.jsx';
import { Panel, Button, Notice } from '../../components/ui';

/** Shift a 'YYYY-MM-DD' string by n days (local time). */
function shiftYMD(ymd, n) {
  const d = new Date(`${ymd}T00:00:00`);
  d.setDate(d.getDate() + n);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The three independent availability calendars the windows panel can edit. */
const SCOPES = [
  { key: 'shop', label: 'Shop delivery' },
  { key: 'laundry', label: 'Laundry' },
  { key: 'cleaning', label: 'Cleaning' },
];

/**
 * /admin/schedule — the week at a glance (blueprint §5.4). Pick a day to see
 * every home visit due, and open/close its booking windows (which is what
 * the customer slot picker feeds off). The windows panel edits one service
 * calendar at a time (shop / laundry / cleaning); the visits list shows all.
 */
export default function AdminSchedule() {
  const [start, setStart] = useState(''); // '' = week starting today
  const [scope, setScope] = useState('shop'); // which availability calendar to edit
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const d = await getAdminSchedule({ start, days: 7, scope });
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
  }, [start, scope]);

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

  const weekLabel = data
    ? `${data.days[0].month} ${data.days[0].dayNum} – ${data.days[6].month} ${data.days[6].dayNum}`
    : 'Loading…';

  return (
    <AdminPage>
      <AdminSectionHeader
        eyebrow="Schedule"
        title={`Week of ${weekLabel}`}
        action={
          <>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              aria-label="Which availability calendar to edit"
              className="h-11 rounded-btn border border-line bg-white px-4 text-[15px] font-semibold text-navy-900"
            >
              {SCOPES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label} calendar
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => data && setStart(shiftYMD(data.start, -7))}
            >
              ‹ Prev
            </Button>

            {!isThisWeek && (
              <Button variant="outline" size="sm" onClick={() => setStart('')}>
                Today
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => data && setStart(shiftYMD(data.start, 7))}
            >
              Next ›
            </Button>
          </>
        }
      />

      <Notice tone="info" className="mb-6">
        <strong>Three independent calendars.</strong> Laundry, cleaning and shop delivery each have
        their own availability, because they're run by different teams. Opening a window here only
        affects the <b>{SCOPES.find((s) => s.key === scope)?.label.toLowerCase()}</b> calendar
        selected above.
        {data?.usesBookingWindow && (
          <>
            {' '}
            This calendar sells a rolling <b>{data.bookingWindowDays} days</b> (to{' '}
            {data.bookingWindowEnd}): inside it a day is either open or shows as{' '}
            <b>booked</b>, and past it customers see <b>not available yet</b>. You can still roster
            further ahead — those days go live as the window reaches them.
          </>
        )}
      </Notice>

      {error && (
        <Notice tone="warn" className="mb-6" icon={<AlertIcon className="mt-0.5 flex-none" />}>
          {error}
        </Notice>
      )}

      {loading || !data ? (
        <div className="space-y-5">
          <div className="bc-skeleton h-24 rounded-btn" />
          <div className="bc-skeleton h-80 rounded-card" />
        </div>
      ) : (
        <>
          <div className="mb-6">
            <DayStrip days={data.days} selected={selected} onSelect={setSelected} />
          </div>

          {day && (
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Visits due on the selected day */}
              <div className="lg:col-span-3">
                <Panel
                  as="h2"
                  title={`${day.weekday} ${day.dayNum} ${day.month} · jobs`}
                  action={<span className="bc-meta text-muted">{day.jobs.length}</span>}
                  padded
                >
                  {day.jobs.length === 0 ? (
                    <div className="rounded-card border border-dashed border-line px-6 py-10 text-center">
                      <p className="bc-h4">No visits this day</p>
                      <p className="mx-auto mt-2 max-w-sm bc-meta text-muted">
                        Open a booking window so customers can book this day.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {day.jobs.map((j, i) => (
                        <JobRow key={`${j.orderId}-${j.window}-${i}`} job={j} />
                      ))}
                    </div>
                  )}
                </Panel>
              </div>

              {/* Slot windows for the selected day (remounts per day) */}
              <div className="lg:col-span-2">
                <SlotManager
                  key={`${day.date}-${scope}`}
                  day={day}
                  busy={busy}
                  windowDays={data.bookingWindowDays}
                  onToggleWindow={(window, available, note) =>
                    mutate(() => setDeliverySlot(day.date, window, available, note, scope))
                  }
                  onSaveNote={(window, available, note) =>
                    mutate(() => setDeliverySlot(day.date, window, available, note, scope))
                  }
                  onSetDay={(available) => mutate(() => setDeliveryDay(day.date, available, scope))}
                />
              </div>
            </div>
          )}
        </>
      )}
    </AdminPage>
  );
}
