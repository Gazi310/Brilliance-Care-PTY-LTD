import { useState } from 'react';
import SlotCalendar from '../products/SlotCalendar.jsx';

/**
 * A collapsible "pick a day & window" field wrapping the month-grid
 * SlotCalendar (the calendar system used across the app — chosen over the
 * wireframe's date-chip buttons). Shows the chosen slot inline once picked.
 */
export default function SlotField({ icon, title, hint, accent = 'sky', value, onChange, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface/60"
      >
        <span className="text-xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">{title}</p>
          {value ? (
            <p className="truncate text-xs font-semibold text-aqua-d">
              {value.dateLabel} · {value.label} ({value.time})
            </p>
          ) : (
            <p className="truncate text-xs text-faint">{hint}</p>
          )}
        </div>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onChange?.(null);
              }
            }}
            className="rounded-full px-1.5 text-faint transition hover:bg-surface hover:text-muted"
            aria-label={`Clear ${title}`}
          >
            ✕
          </span>
        )}
        <svg
          className={`h-4 w-4 shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-line p-3">
          <SlotCalendar
            value={value}
            accent={accent}
            onChange={(s) => {
              onChange?.(s);
              if (s) setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
