import { useState } from 'react';
import { updateSettings } from '../../../services/settingsService.js';
import { AlertIcon } from '../icons.jsx';
import { Panel, Button, Field, Notice } from '../../ui';

const FIELDS = [
  { key: 'businessName', label: 'Trading name', placeholder: 'Brilliance Care PTY LTD', full: true },
  { key: 'abn', label: 'ABN', placeholder: '00 000 000 000' },
  { key: 'businessPhone', label: 'Phone', placeholder: '+61 4xx xxx xxx', type: 'tel' },
  {
    key: 'businessEmail',
    label: 'Email',
    placeholder: 'hello@brilliancecare.com.au',
    type: 'email',
    full: true,
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
    <Panel as="h2" title="Business details">
      <form onSubmit={save} className="px-6 py-6">
        <p className="bc-meta text-muted">
          These feed the site footer, invoices, and the closing call-to-action on every marketing
          page.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <Field
              key={f.key}
              id={`set-${f.key}`}
              size="sm"
              type={f.type || 'text'}
              label={f.label}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={set(f.key)}
              wrapperClassName={f.full ? 'sm:col-span-2' : ''}
            />
          ))}

          <Field
            id="set-postcodes"
            as="textarea"
            size="sm"
            rows={2}
            label="Service-area postcodes"
            placeholder="e.g. 3128, 3124, 3108 — leave empty to accept any Australian postcode"
            hint="Separate with commas or spaces. Drives the postcode checker in the hero, the service-area section and the footer. Leave it empty and every postcode is accepted."
            value={form.servicePostcodes}
            onChange={set('servicePostcodes')}
            wrapperClassName="sm:col-span-2"
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button variant="navy" size="sm" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save details'}
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
