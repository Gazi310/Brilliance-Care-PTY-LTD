import { useState } from 'react';
import { Panel, Button, Tag } from '../../ui';

/**
 * Open/close the three bookable windows for one day (feeds the customer
 * slot picker — windows are occupied unless explicitly opened). Each
 * window also takes an optional note, e.g. "Public holiday".
 *
 * Phase 8 restyle. The toggle is now gold-when-open rather than aqua:
 * gold as a *fill* is legal and it's the app's affirmative colour, so
 * "this window is bookable" reads the same here as "this is the next
 * step" does everywhere else. Behaviour, including the save-on-blur
 * note, is unchanged.
 *
 * The status pill mirrors what a customer actually sees. On the laundry
 * calendar a closed window inside the booking fortnight reads "Booked";
 * past the fortnight it reads "Not open yet", because the day isn't for
 * sale regardless of this toggle. `status` comes off the schedule payload
 * (server/utils/delivery.js owns the rule) so this component doesn't have
 * to know which scope it's editing.
 */
const STATUS_TAG = {
  available: { tone: 'ok', label: 'Open' },
  booked: { tone: 'bad', label: 'Booked' },
  unavailable: { tone: 'neutral', label: 'Not open yet' },
};

export default function SlotManager({
  day,
  busy,
  windowDays = null,
  onToggleWindow,
  onSaveNote,
  onSetDay,
}) {
  // Draft notes keyed by window; initialised lazily from the loaded slots.
  const [notes, setNotes] = useState(() =>
    Object.fromEntries(day.slots.map((s) => [s.window, s.note]))
  );

  const saveNote = (slot) => {
    const draft = (notes[slot.window] ?? '').trim();
    if (draft !== slot.note) onSaveNote(slot.window, slot.available, draft);
  };

  return (
    <Panel
      title="Booking windows"
      action={
        <span className="flex gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onSetDay(true)}
            className="px-3 py-1.5 text-[13px]">
            Open all
          </Button>
          <Button variant="outline" size="sm" disabled={busy} onClick={() => onSetDay(false)}
            className="px-3 py-1.5 text-[13px]">
            Close all
          </Button>
        </span>
      }
    >
      {/* Rostering ahead is allowed; pretending it's live is not. */}
      {day.beyondWindow && (
        <p className="border-b border-line bg-warn-bg px-6 py-3 text-[13px] font-semibold leading-snug text-warn">
          Past the {windowDays ? `${windowDays}-day ` : ''}booking window — customers can&apos;t book
          this day yet. Windows you open here go live automatically once the window reaches them.
        </p>
      )}

      {day.slots.map((s) => {
        const tag =
          STATUS_TAG[s.status] ?? (s.available ? STATUS_TAG.available : STATUS_TAG.unavailable);

        return (
          <div key={s.window} className="border-b border-line px-6 py-4 last:border-b-0">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy-900">{s.label}</p>
                <p className="mt-0.5 bc-meta text-muted">{s.time}</p>
              </div>

              <Tag tone={tag.tone}>{tag.label}</Tag>

              <button
                type="button"
                disabled={busy}
                onClick={() => onToggleWindow(s.window, !s.available, (notes[s.window] ?? '').trim())}
                role="switch"
                aria-checked={s.available}
                aria-label={`${s.available ? 'Close' : 'Open'} the ${s.label} window`}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                  s.available ? 'bg-gold-500' : 'bg-line'
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
              aria-label={`Note for the ${s.label} window`}
              className="mt-3 h-10 w-full rounded-btn border border-line bg-white px-3 text-[14px] text-ink placeholder:text-muted disabled:opacity-50"
            />
          </div>
        );
      })}
    </Panel>
  );
}
