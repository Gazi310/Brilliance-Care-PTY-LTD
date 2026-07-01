import { useEffect, useRef, useState } from 'react';
import SlotCalendar from './SlotCalendar.jsx';

/* ------------------------------------------------------------------ */
/*  A trigger button that opens the SlotCalendar in a popover. Shows    */
/*  the current selection as its label. Used for product delivery, and  */
/*  laundry pickup / return. Admin mode turns it into an availability    */
/*  editor.                                                              */
/* ------------------------------------------------------------------ */

const ACCENT_BTN = {
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',
  sky: 'from-sky-500 to-blue-600 shadow-sky-500/25',
  amber: 'from-amber-500 to-orange-600 shadow-amber-500/25',
  violet: 'from-violet-600 to-fuchsia-600 shadow-fuchsia-500/25',
};

export default function SlotPickerButton({
  value = null,
  onChange,
  isAdmin = false,
  notify,
  icon = '🚚',
  label = 'Delivery slot',
  accent = 'emerald',
  align = 'right',
  block = false,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = !isAdmin && value;
  const btnLabel = isAdmin
    ? label
    : value
      ? `${value.weekday} ${value.month} ${value.dayNum} · ${value.label}`
      : label;

  // Close the popover automatically once a customer has picked a slot.
  const handleChange = (slot) => {
    onChange?.(slot);
    if (!isAdmin && slot) setOpen(false);
  };

  return (
    <div ref={wrapRef} className={`relative ${block ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-md transition hover:-translate-y-0.5 active:scale-95 ${block ? 'w-full justify-between' : ''} ${
          selected
            ? `bg-gradient-to-r text-white ${ACCENT_BTN[accent] || ACCENT_BTN.emerald}`
            : 'border border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:text-violet-700'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="truncate">{btnLabel}</span>
        </span>
        {selected ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(null);
            }}
            className="rounded-full px-1 text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label="Clear slot"
          >
            ✕
          </span>
        ) : (
          <svg
            className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className={`bc-fade-up absolute z-50 mt-2 w-[20rem] overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl ring-1 ring-black/5 ${
            align === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
          }`}
        >
          <SlotCalendar isAdmin={isAdmin} value={value} onChange={handleChange} notify={notify} accent={accent} />
        </div>
      )}
    </div>
  );
}
