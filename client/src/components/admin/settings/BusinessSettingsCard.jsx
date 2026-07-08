import { useState } from 'react';
import { updateSettings } from '../../../services/settingsService.js';

const FIELDS = [
  { key: 'businessName', label: 'Business name', placeholder: 'Brilliance Care PTY LTD' },
  { key: 'abn', label: 'ABN', placeholder: '00 000 000 000' },
  { key: 'businessPhone', label: 'Phone', placeholder: '+61 4xx xxx xxx', type: 'tel' },
  {
    key: 'businessEmail',
    label: 'Email',
    placeholder: 'hello@brilliancecare.com.au',
    type: 'email',
  },
  { key: 'businessAddress', label: 'Based in', placeholder: 'Suburb, State, Postcode' },
  { key: 'businessHours', label: 'Opening hours', placeholder: 'Mon – Sat · 8:00 – 18:00' },
];

/**
 * Business identity + service area (blueprint §5.8). These details feed the
 * public Footer and the homepage "do we service your postcode?" checker.
 */
export default function BusinessSettingsCard({ settings, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...Object.fromEntries(FIELDS.map((f) => [f.key, settings[f.key] || ''])),
    servicePostcodes: (settings.servicePostcodes || []).join(', '),
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await updateSettings(form); // server parses the postcode string
      onSaved(updated);
      setForm((f) => ({ ...f, servicePostcodes: (updated.servicePostcodes || []).join(', ') }));
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
      <h2 className="text-sm font-extrabold text-ink">Business details</h2>
      <p className="mt-0.5 text-[11px] text-faint">
        Shown in the site footer and used by the homepage postcode checker.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs font-bold text-muted">{f.label}</span>
            <input
              type={f.type || 'text'}
              value={form[f.key]}
              onChange={set(f.key)}
              placeholder={f.placeholder}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-faint focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30"
            />
          </label>
        ))}
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-bold text-muted">Service-area postcodes</span>
        <textarea
          value={form.servicePostcodes}
          onChange={set('servicePostcodes')}
          rows={2}
          placeholder="e.g. 2150, 2151, 2152 — leave empty to accept any Australian postcode"
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-faint focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30"
        />
        <span className="mt-1 block text-[11px] text-faint">
          Separate with commas or spaces. The homepage checker says &ldquo;yes&rdquo; only to
          these postcodes when the list isn&rsquo;t empty.
        </span>
      </label>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save details'}
        </button>
        {saved && <span className="text-xs font-bold text-emerald-600">Saved ✓</span>}
        {error && <span className="text-xs font-medium text-red-600">⚠️ {error}</span>}
      </div>
    </form>
  );
}
