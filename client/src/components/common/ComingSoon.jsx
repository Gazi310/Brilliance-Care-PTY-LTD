import { Link } from 'react-router-dom';

/**
 * Shared placeholder for pages that are routed now but fully built in a later
 * phase. Keeps pages thin — each page just composes this with its own copy.
 *
 * Props:
 *   eyebrow      small uppercase kicker (e.g. "Account")
 *   title        page heading
 *   description  one or two sentences of context
 *   phase        optional "Coming in {phase}" badge (e.g. "Phase 1")
 *   links        optional [{ to, label }] quick-links grid
 */
export default function ComingSoon({ eyebrow, title, description, phase, links = [] }) {
  return (
    <main className="min-h-screen bg-surface pb-28 lg:pb-16">
      <div className="bc-fade-up mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-aqua text-white shadow-cta">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.3 6.4L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3L12 2z" />
          </svg>
        </span>

        {eyebrow && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-faint">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}

        {phase && (
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-bold text-navy shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-aqua" />
            Coming in {phase}
          </span>
        )}

        {links.length > 0 && (
          <div className="mt-9 grid w-full gap-3 sm:grid-cols-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-2xl border border-line bg-white px-5 py-4 text-sm font-bold text-ink shadow-soft transition hover:-translate-y-0.5 hover:text-navy"
              >
                {l.label}
                <span className="mt-1 block text-xs font-semibold text-faint">Explore →</span>
              </Link>
            ))}
          </div>
        )}

        <Link
          to="/"
          className="mt-9 inline-flex items-center gap-1.5 text-sm font-bold text-navy transition hover:text-aqua-d"
        >
          <span className="text-base leading-none">←</span> Back home
        </Link>
      </div>
    </main>
  );
}
