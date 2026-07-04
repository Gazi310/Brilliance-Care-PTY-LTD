import { Link } from 'react-router-dom';

/* Footer link groups. Routes marked (soon) render placeholder pages for now. */
const SERVICES = [
  { to: '/laundry', label: 'Laundry pickup & delivery' },
  { to: '/cleaning', label: 'Home cleaning' },
  { to: '/products', label: 'Shop' },
  { to: '/book', label: 'Book a service' },
];
const SUPPORT = [
  { to: '/pricing', label: 'Pricing' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];
const ACCOUNT = [
  { to: '/account/orders', label: 'Your orders' },
  { to: '/account/profile', label: 'Profile & settings' },
  { to: '/login', label: 'Log in' },
];

function FooterCol({ title, links }) {
  return (
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-white/50">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-navy to-navy-d text-white">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-28 sm:px-6 sm:pt-14 lg:pb-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand + business details */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5" aria-label="Brilliance Care home">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-aqua to-mint text-navy-d shadow-cta">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.3 6.4L21 11l-6.7 2.3L12 20l-2.3-6.7L3 11l6.7-2.3L12 2z" />
                </svg>
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[15px] font-extrabold tracking-tight">Brilliance Care</span>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
                  Laundry &amp; Cleaning
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Laundry pickup &amp; delivery and home cleaning across{' '}
              <span className="text-white/90">[Your City]</span>, Australia. Book in minutes, pay a
              small deposit, and settle the balance once the work&rsquo;s done.
            </p>

            {/* TODO: replace the bracketed placeholders with real business details */}
            <p className="mt-4 text-xs leading-relaxed text-white/55">
              Servicing <span className="text-white/80">[list suburbs]</span> — check your postcode
              when you book.
              <br />
              <a href="mailto:hello@brilliancecare.com.au" className="hover:text-white">
                hello@brilliancecare.com.au
              </a>{' '}
              ·{' '}
              <a href="tel:+61000000000" className="hover:text-white">
                +61 0000 000 000
              </a>
            </p>
          </div>

          <FooterCol title="Services" links={SERVICES} />
          <FooterCol title="Support" links={SUPPORT} />
          <FooterCol title="Account" links={ACCOUNT} />
        </div>

        {/* Bottom bar */}
        <div className="mt-11 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Brilliance Care Pty Ltd · ABN [00 000 000 000]</p>
          <p>All prices in AUD, GST included.</p>
        </div>
      </div>
    </footer>
  );
}
