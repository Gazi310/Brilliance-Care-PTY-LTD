import { useMemo, useState } from 'react';
import { updateSettings } from '../../../services/settingsService.js';
import { AlertIcon } from '../icons.jsx';
import { Panel, Button, Field, Notice } from '../../ui';

/**
 * How far ahead the laundry calendar sells (blueprint §5.8).
 *
 * This is the knob behind the calendar's third state. Inside the window a
 * day is either open or shows as **booked**; past it customers see **not
 * available yet**, because the crew is only rostered a fortnight out and
 * "we haven't opened that week" is a different message from "we're full".
 *
 * The window is a *rolling* count from today, not a fixed end date — set 14
 * and the calendar always sells today plus the next thirteen days. The admin
 * can still open days beyond it on /admin/schedule; those simply go live as
 * the window reaches them.
 *
 * Cleaning and shop delivery ignore this — they stay open/closed only. See
 * HORIZON_SCOPES in server/utils/delivery.js.
 */
export default function BookingWindowCard({ settings, onSaved }) {
  const [days, setDays] = useState(String(settings.bookingWindowDays ?? 14));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Preview the last bookable date so the number means something concrete.
  const lastDate = useMemo(() => {
    const n = Number(days);
    if (!Number.isInteger(n) || n < 1 || n > 60) return null;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n - 1);
    return d.toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [days]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await updateSettings({ bookingWindowDays: Number(days) });
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel as="h2" title="Laundry booking window">
      <form onSubmit={save} className="px-6 py-6">
        <p className="bc-meta text-muted">
          How far ahead customers can book laundry pickups and returns, counting today as day one.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            id="set-booking-window"
            size="sm"
            type="number"
            min="1"
            max="60"
            step="1"
            required
            label="Booking window (days)"
            hint={lastDate ? `Last bookable day right now: ${lastDate}.` : '1 – 60 days.'}
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </div>

        <div className="mt-5 rounded-card bg-sky-50 px-5 py-4">
          <p className="text-[13px] font-bold text-navy-900">What customers see</p>
          <ul className="mt-2 space-y-1.5 bc-meta text-muted">
            <li>
              <b className="text-navy-900">Available</b> — inside the window, with a slot you've
              opened.
            </li>
            <li>
              <b className="text-navy-900">Booked</b> — inside the window, nothing open.
            </li>
            <li>
              <b className="text-navy-900">Not available yet</b> — past the window.
            </li>
          </ul>
          <p className="mt-2.5 bc-meta text-muted">
            You can still open days beyond the window on the schedule page — they go live on their
            own as the window rolls forward.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button variant="navy" size="sm" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save booking window'}
          </Button>
          {saved && <span className="bc-meta font-bold text-ok">Saved ✓</span>}
        </div>

        {error && (
          <Notice tone="warn" className="mt-4" icon={<AlertIcon className="mt-0.5 flex-none" />}>
            {error}
          </Notice>
        )}
      </form>
    </Panel>
  );
}
