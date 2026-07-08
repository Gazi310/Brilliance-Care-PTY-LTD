import { useState } from 'react';

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
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <h3 className="text-sm font-extrabold text-ink">Notes</h3>
      <p className="mt-0.5 text-[11px] text-faint">
        Private — only admins see this. Access codes, preferences, anything useful.
      </p>

      {customer.canNote ? (
        <>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="e.g. Side gate code 1234 · allergic to strong fragrance · prefers evening returns"
            className="mt-3 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-faint focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save note'}
            </button>
            {saved && <span className="text-xs font-bold text-emerald-600">Saved ✓</span>}
            {error && <span className="text-xs font-medium text-red-600">⚠️ {error}</span>}
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-xl bg-surface px-3 py-2.5 text-xs text-muted">
          Guest customers can&rsquo;t hold notes — they&rsquo;ll get a profile the day they
          register with this phone number.
        </p>
      )}
    </section>
  );
}
