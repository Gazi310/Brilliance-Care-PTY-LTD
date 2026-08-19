/**
 * The `.week` strip: a 7-day selector showing, per day, how many home
 * visits are booked and how many booking windows are open.
 *
 * Phase 8 restyle. v1 used aqua dots on a white chip and navy on the
 * selected one; v2 inverts to solid navy for the selected day with gold
 * for its counts — gold on navy is the one place gold text is legal, and
 * it's what makes the selected day unmistakable on a dense screen.
 *
 * Seven across on desktop, horizontally scrollable below that rather
 * than squeezed — a 50px-wide day chip isn't tappable.
 */
export default function DayStrip({ days, selected, onSelect }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <div className="grid w-max grid-flow-col gap-2.5 lg:w-full lg:grid-cols-7">
        {days.map((d) => {
          const active = d.date === selected;

          return (
            <button
              key={d.date}
              type="button"
              onClick={() => onSelect(d.date)}
              aria-pressed={active}
              className={`w-[86px] rounded-btn border px-2.5 py-3.5 text-center transition-colors lg:w-auto ${
                active
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-line bg-white text-navy-900 hover:border-navy-500'
              }`}
            >
              <span
                className={`block text-[11px] font-bold uppercase leading-none tracking-[0.08em] ${
                  active ? 'text-sky-100' : 'text-muted'
                }`}
              >
                {d.isToday ? 'Today' : d.weekday}
              </span>

              <span className="my-[7px] block font-display text-[22px] font-bold leading-none">
                {d.dayNum}
              </span>

              <span
                className={`block text-xs font-semibold ${active ? 'text-gold-500' : 'text-muted'}`}
              >
                {d.jobCount > 0 ? `${d.jobCount} job${d.jobCount === 1 ? '' : 's'}` : 'No jobs'}
                {/* Mirrors what the customer sees: a closed day inside the booking
                    window reads "booked", past it there's nothing to book yet. */}
                {d.availableCount === 0 && (d.status === 'booked' ? ' · booked' : ' · closed')}
                {d.availableCount > 0 && d.beyondWindow && ' · not live yet'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
