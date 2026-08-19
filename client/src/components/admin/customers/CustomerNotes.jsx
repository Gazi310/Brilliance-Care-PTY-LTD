import { useState } from 'react';
import { AlertIcon } from '../icons.jsx';
import { Panel, Button, Field, Notice } from '../../ui';

/**
 * Private admin note ("gate code 1234", "prefers Tuesday pickups"…).
 * Only registered accounts can hold a note — guests have no record to
 * attach one to.
 */
export default function CustomerNotes({ customer, onSave }) {
  const [draft, setDraft] = useState(customer.note || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const dirty = draft.trim() !== (customer.note || '');

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await onSave(draft.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel title="Internal note" padded>
      {customer.canNote ? (
        <>
          <Field
            id="customer-note"
            as="textarea"
            size="sm"
            rows={4}
            maxLength={2000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Side gate code 1234 · allergic to strong fragrance · prefers evening returns"
            hint="Staff-only. Never shown to the customer."
          />

          <div className="mt-3.5 flex items-center gap-3">
            <Button variant="navy" size="sm" onClick={save} disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save note'}
            </Button>
            {saved && <span className="bc-meta font-bold text-ok">Saved ✓</span>}
          </div>

          {error && (
            <Notice tone="warn" className="mt-3.5" icon={<AlertIcon className="mt-0.5 flex-none" />}>
              {error}
            </Notice>
          )}
        </>
      ) : (
        <Notice tone="info">
          Guest customers can&rsquo;t hold notes — they&rsquo;ll get a profile the day they register
          with this phone number.
        </Notice>
      )}
    </Panel>
  );
}
