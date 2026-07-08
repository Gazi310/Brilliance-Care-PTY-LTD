/**
 * Horizontal 7-day selector. Each chip shows the weekday, date, how many
 * home visits are booked (navy bubble) and how many of the three windows
 * are open for new bookings (aqua dots).
 */
export default function DayStrip({ days, selected, onSelect }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-1.5">
        {days.map((d) => {
          const active = d.date === selected;
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelect(d.date)}
              className={`relative flex w-16 flex-col items-center rounded-2xl border px-2 pb-2 pt-2.5 transition ${
                active
                  ? 'border-navy bg-navy text-white shadow-soft'
                  : 'border-line bg-white text-ink shadow-soft hover:border-aqua'
              }`}
              aria-pressed={active}
            >
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wide ${
                  active ? 'text-white/70' : d.isWeekend ? 'text-aqua-d' : 'text-faint'
                }`}
              >
                {d.isToday ? 'Today' : d.weekday}
              </span>
              <span className="mt-0.5 text-lg font-extrabold leading-none">{d.dayNum}</span>

              {/* Open windows (dots) + booked visits (bubble) */}
              <span className="mt-1.5 flex h-4 items-center gap-1">
                {d.jobCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[9px] font-extrabold leading-4 ${
                      active ? 'bg-white/20 text-white' : 'bg-navy text-white'
                    }`}
                  >
                    {d.jobCount}
                  </span>
                )}
                {Array.from({ length: d.availableCount }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-mint' : 'bg-aqua'}`}
                    aria-hidden="true"
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
