import { useState } from 'react';
import { updateSettings } from '../../../services/settingsService.js';
import { AlertIcon } from '../icons.jsx';
import { Panel, Button, Field, Notice } from '../../ui';

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
    <Panel as="h2" title="Pricing & tax">
      <form onSubmit={save} className="px-6 py-6">
        <p className="bc-meta text-muted">
          Applies to new bookings — orders already placed keep their original numbers.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            id="set-deposit"
            size="sm"
            type="number"
            min="0"
            max="100"
            step="1"
            required
            label="Deposit percentage"
            hint="Percent of the estimate taken at booking."
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
          />

          <Field
            id="set-fee"
            size="sm"
            type="number"
            min="0"
            step="0.01"
            required
            label="Shop delivery fee ($)"
            hint="Flat fee on shop-only orders. Free when attached to a booking."
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </div>

        {/* GST switch */}
        <div className="mt-6 flex items-start justify-between gap-5 border-t border-line pt-5">
          <div>
            <p className="font-semibold text-navy-900">Business is registered for GST</p>
            <p className="mt-1 bc-meta text-muted">
              Switching this off sets GST to $0 across estimates, invoices and the footer — it does
              not change the displayed prices.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setGstEnabled((v) => !v)}
            role="switch"
            aria-checked={gstEnabled}
            aria-label="Toggle GST"
            className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${
              gstEnabled ? 'bg-gold-500' : 'bg-line'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                gstEnabled ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button variant="navy" size="sm" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save pricing'}
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
