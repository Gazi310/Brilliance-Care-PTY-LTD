import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSettings } from '../../services/settingsService';

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

  // Business details come from /admin/settings; sensible fallbacks until set.
  const [biz, setBiz] = useState(null);
  useEffect(() => {
    let on = true;
    getSettings()
      .then((s) => on && setBiz(s))
      .catch(() => {}); // offline → keep fallbacks
    return () => {
      on = false;
    };
  }, []);

  const email = biz?.businessEmail || 'hello@brilliancecare.com.au';
  const phone = biz?.businessPhone || '';
  const area = biz?.businessAddress || 'Australia';
  const hours = biz?.businessHours || '';
  const abn = biz?.abn || '';
  const name = biz?.businessName || 'Brilliance Care Pty Ltd';
  const codes = biz?.servicePostcodes || [];

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
              <span className="text-white/90">{area}</span>. Book in minutes, pay a small deposit,
              and settle the balance once the work&rsquo;s done.
            </p>

            {/* Business details managed in /admin/settings */}
            <p className="mt-4 text-xs leading-relaxed text-white/55">
              {codes.length > 0 ? (
                <>
                  Servicing postcodes{' '}
                  <span className="text-white/80">
                    {codes.slice(0, 6).join(', ')}
                    {codes.length > 6 ? ` +${codes.length - 6} more` : ''}
                  </span>{' '}
                  — check yours when you book.
                </>
              ) : (
                <>Check your postcode when you book.</>
              )}
              {hours && (
                <>
                  {' '}
                  Open <span className="text-white/80">{hours}</span>.
                </>
              )}
              <br />
              <a href={`mailto:${email}`} className="hover:text-white">
                {email}
              </a>
              {phone && (
                <>
                  {' '}
                  ·{' '}
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white">
                    {phone}
                  </a>
                </>
              )}
            </p>
          </div>

          <FooterCol title="Services" links={SERVICES} />
          <FooterCol title="Support" links={SUPPORT} />
          <FooterCol title="Account" links={ACCOUNT} />
        </div>

        {/* Bottom bar */}
        <div className="mt-11 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {name}
            {abn ? ` · ABN ${abn}` : ''}
          </p>
          <p>All prices in AUD{biz?.gstEnabled === false ? '' : ', GST included'}.</p>
        </div>
      </div>
    </footer>
  );
}
