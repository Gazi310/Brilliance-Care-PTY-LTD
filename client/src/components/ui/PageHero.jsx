import { Link } from 'react-router-dom';
import Container from './Container.jsx';

/**
 * PageHero — the navy breadcrumb banner at the top of an inner page.
 *
 * Everything except the homepage opens with one of these, which is
 * what gives the site a consistent entry point per page. The
 * left-to-right gradient overlay is the one gradient v2 keeps, and
 * only because it's an image scrim, not decoration — it exists so
 * white text stays legible over an unpredictable photograph.
 *
 * crumbs: [{ label, to }] — the last entry renders as plain text.
 */
export default function PageHero({ title, sub, crumbs = [], image, className = '' }) {
  return (
    <header
      className={`relative overflow-hidden bg-navy-900 px-5 py-9 text-white lg:px-20 lg:py-16 ${className}`}
    >
      {/* Photo layer */}
      <div className="absolute inset-0 z-0 grid place-items-center bg-navy-800">
        {image && (
          <img src={image} alt="" className="h-full w-full object-cover" aria-hidden="true" />
        )}
      </div>

      {/* Legibility scrim — opaque at the text edge, clearing to the right. */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(90deg, rgba(4,30,96,.97) 0%, rgba(4,30,96,.86) 52%, rgba(4,30,96,.55) 100%)',
        }}
        aria-hidden="true"
      />

      <Container className="relative z-[2]">
        {crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-[9px] text-[13.5px] font-semibold text-sky-100"
          >
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <span key={`${c.label}-${i}`} className="flex items-center gap-[9px]">
                  {last || !c.to ? (
                    <span aria-current={last ? 'page' : undefined}>{c.label}</span>
                  ) : (
                    <Link to={c.to} className="opacity-80 hover:underline hover:opacity-100">
                      {c.label}
                    </Link>
                  )}
                  {!last && (
                    <span className="opacity-45" aria-hidden="true">
                      ›
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        )}

        <h1 className="bc-h1 text-[30px] text-white lg:text-5xl">{title}</h1>
        {sub && <p className="bc-lead mt-3.5 max-w-[640px] text-sky-100">{sub}</p>}
      </Container>
    </header>
  );
}
