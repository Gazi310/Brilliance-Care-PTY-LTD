import { useState } from 'react';

/**
 * Open/close the three bookable windows for one day (feeds the customer
 * slot picker — windows are occupied unless explicitly opened). Each
 * window also takes an optional note, e.g. "Public holiday".
 */
export default function SlotManager({ day, busy, onToggleWindow, onSaveNote, onSetDay }) {
  // Draft notes keyed by window; initialised lazily from the loaded slots.
  const [notes, setNotes] = useState(() =>
    Object.fromEntries(day.slots.map((s) => [s.window, s.note]))
  );

  const saveNote = (slot) => {
    const draft = (notes[slot.window] ?? '').trim();
    if (draft !== slot.note) onSaveNote(slot.window, slot.available, draft);
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-ink">Booking windows</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetDay(true)}
            className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-navy transition hover:border-aqua disabled:opacity-50"
          >
            Open all
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetDay(false)}
            className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-bold text-muted transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
          >
            Close all
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {day.slots.map((s) => (
          <div
            key={s.window}
            className={`rounded-xl border p-3 transition ${
              s.available ? 'border-aqua/40 bg-aqua/5' : 'border-line bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{s.label}</p>
                <p className="text-[11px] text-faint">{s.time}</p>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  s.available ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s.available ? 'Open' : 'Closed'}
              </span>

              <button
                type="button"
                disabled={busy}
                onClick={() => onToggleWindow(s.window, !s.available, (notes[s.window] ?? '').trim())}
                role="switch"
                aria-checked={s.available}
                aria-label={`${s.available ? 'Close' : 'Open'} the ${s.label} window`}
                className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
                  s.available ? 'bg-aqua' : 'bg-line'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    s.available ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <input
              type="text"
              value={notes[s.window] ?? ''}
              onChange={(e) => setNotes((n) => ({ ...n, [s.window]: e.target.value }))}
              onBlur={() => saveNote(s)}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder="Note (e.g. Public holiday) — saves when you click away"
              disabled={busy}
              className="mt-2 w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-faint focus:border-aqua focus:outline-none disabled:opacity-50"
              aria-label={`Note for the ${s.label} window`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
