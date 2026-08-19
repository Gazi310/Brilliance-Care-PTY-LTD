import { useState } from 'react';
import SlotCalendar from '../products/SlotCalendar.jsx';
import { resolveSlotAccent } from '../products/slotAccents.js';
import { IconBadge } from '../ui';
import { ChevronRightIcon } from './icons.jsx';

/**
 * A collapsible "pick a day & window" field wrapping the month-grid
 * SlotCalendar (the calendar system used across the app — chosen over the
 * wireframe's date-chip buttons). Shows the chosen slot inline once picked.
 *
 * The IconBadge tone is what tells the three booking slots apart now that
 * they all share one palette — sky for pickup, gold for return, navy for
 * the cleaning visit. See products/slotAccents.js.
 */
export default function SlotField({ icon, title, hint, accent = 'pickup', value, onChange, defaultOpen = false, scope = 'shop' }) {
  const [open, setOpen] = useState(defaultOpen);
  const a = resolveSlotAccent(accent);

  return (
    <div className="bc-card-light overflow-hidden rounded-card border border-line bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3.5 p-4 text-left transition hover:bg-sky-50"
      >
        <IconBadge size="inline" tone={a.badge} icon={icon} />
        <div className="min-w-0 flex-1">
          <p className="bc-h4">{title}</p>
          {value ? (
            <p className="truncate text-[13px] font-semibold text-navy-500">
              {value.dateLabel} · {value.label} ({value.time})
            </p>
          ) : (
            <p className="truncate text-[13px] text-muted">{hint}</p>
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
            className="grid h-7 w-7 flex-none place-items-center rounded-full text-muted transition hover:bg-sky-100 hover:text-navy-900"
            aria-label={`Clear ${title}`}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
        )}
        <ChevronRightIcon
          width={16}
          height={16}
          className={`flex-none text-navy-500 transition-transform ${open ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="border-t border-line p-4">
          <SlotCalendar
            value={value}
            accent={accent}
            scope={scope}
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
