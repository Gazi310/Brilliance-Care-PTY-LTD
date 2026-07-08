import { useState } from 'react';
import { updateSettings } from '../../../services/settingsService.js';

/**
 * The money knobs (blueprint §5.8): deposit %, per-visit delivery fee and
 * the GST switch. Changes apply to NEW bookings — existing orders keep the
 * numbers they were created with.
 */
export default function PricingSettingsCard({ settings, onSaved }) {
  const [deposit, setDeposit] = useState(String(settings.depositPercent));
  const [fee, setFee] = useState(String(settings.deliveryFee));
  const [gstEnabled, setGstEnabled] = useState(settings.gstEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await updateSettings({
        depositPercent: Number(deposit),
        deliveryFee: Number(fee),
        gstEnabled,
      });
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
    <form onSubmit={save} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <h2 className="text-sm font-extrabold text-ink">Pricing &amp; tax</h2>
      <p className="mt-0.5 text-[11px] text-faint">
        Applies to new bookings — orders already placed keep their original numbers.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold text-muted">Deposit % of estimate</span>
          <div className="relative mt-1">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 pr-8 text-sm font-bold text-ink focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30"
              required
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint">
              %
            </span>
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-muted">Delivery fee per visit (shop)</span>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-faint">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 pl-7 text-sm font-bold text-ink focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30"
              required
            />
          </div>
        </label>
      </div>

      {/* GST switch */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-surface px-3.5 py-3">
        <div>
          <p className="text-sm font-bold text-ink">GST (10%)</p>
          <p className="text-[11px] text-muted">
            Prices stay GST-inclusive; this controls the GST line shown on estimates &amp; invoices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGstEnabled((v) => !v)}
          role="switch"
          aria-checked={gstEnabled}
          aria-label="Toggle GST"
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            gstEnabled ? 'bg-aqua' : 'bg-line'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
              gstEnabled ? 'left-[22px]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save pricing'}
        </button>
        {saved && <span className="text-xs font-bold text-emerald-600">Saved ✓</span>}
        {error && <span className="text-xs font-medium text-red-600">⚠️ {error}</span>}
      </div>
    </form>
  );
}
