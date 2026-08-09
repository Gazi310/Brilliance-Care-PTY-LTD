/**
 * Timeline — vertical order-progress list.
 *
 * Used on the confirmation page and in order detail. The connecting
 * line is drawn as a pseudo-element from each dot down to the next,
 * suppressed on the last item.
 *
 * items: [{ title, meta, state }] where state is
 *        'done' | 'now' | 'todo' (default).
 * The gold 'now' dot is the only gold on those screens, which is
 * exactly what you want: it points at where the order actually is.
 */

const DOT = {
  done: 'bg-ok-bg text-ok',
  now: 'bg-gold-500 text-navy-900',
  todo: 'bg-line text-muted',
};

export default function Timeline({ items = [], className = '' }) {
  return (
    <ol className={`m-0 list-none p-0 ${className}`}>
      {items.map((item, i) => {
        const state = item.state ?? 'todo';
        const last = i === items.length - 1;

        return (
          <li
            key={item.title}
            className={`relative flex gap-4 ${last ? 'pb-0' : 'pb-[26px]'}`}
          >
            {!last && (
              <span
                className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-line"
                aria-hidden="true"
              />
            )}

            <span
              className={`relative z-[1] grid h-8 w-8 flex-none place-items-center rounded-full text-sm font-bold ${
                DOT[state] ?? DOT.todo
              }`}
            >
              {state === 'done' ? '✓' : i + 1}
            </span>

            <div className="min-w-0 flex-1 pt-1">
              <p className="bc-h4">{item.title}</p>
              {item.meta && <p className="bc-meta mt-1 text-muted">{item.meta}</p>}
              {item.children}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
