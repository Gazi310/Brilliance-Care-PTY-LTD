import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import BrandMark from './BrandMark.jsx';
import Container from '../ui/Container.jsx';

/* Footer link groups. Business details come from /admin/settings. */
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
    <div className="min-w-0 flex-1">
      <h3 className="mb-5 text-xs font-extrabold uppercase leading-none tracking-[0.12em] text-gold-500">
        {title}
      </h3>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-base text-sky-100 no-underline hover:underline hover:underline-offset-4"
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

  // Shared with the homepage's postcode checks and closing CTA — the
  // hook memoises the request so /api/settings is fetched once, not
  // once per component that happens to need a business detail.
  const biz = useSettings();

  const email = biz?.businessEmail || 'hello@brilliancecare.com.au';
  const phone = biz?.businessPhone || '';
  const area = biz?.businessAddress || "Melbourne's eastern suburbs";
  const hours = biz?.businessHours || '';
  const abn = biz?.abn || '';
  const name = biz?.businessName || 'Brilliance Care Pty Ltd';
  const codes = biz?.servicePostcodes || [];

  return (
    // pb-28 clears the mobile BottomTabBar, which is fixed over the page.
    <footer className="bg-navy-900 px-5 pb-28 pt-14 text-white lg:px-20 lg:pb-10 lg:pt-20">
      <Container>
        <div className="flex flex-col gap-9 lg:flex-row lg:gap-10">
          {/* Brand + business details */}
          <div className="min-w-0 lg:flex-[1.6]">
            <BrandMark />

            <p className="mt-5 max-w-sm text-base leading-relaxed text-sky-100">
              Family-run laundry and cleaning, looking after {area}. Book in minutes, pay a 50%
              deposit, and settle the balance once the work&rsquo;s done.
            </p>

            <p className="mt-4 text-sm leading-relaxed text-sky-100/80">
              {codes.length > 0 ? (
                <>
                  Servicing postcodes{' '}
                  <span className="text-white">
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
                  Open <span className="text-white">{hours}</span>.
                </>
              )}
              <br />
              <a href={`mailto:${email}`} className="hover:text-white hover:underline">
                {email}
              </a>
              {phone && (
                <>
                  {' · '}
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="hover:text-white hover:underline"
                  >
                    {phone}
                  </a>
                </>
              )}
            </p>

            {abn && <p className="mt-3.5 text-sm text-[#8fa9d6]">ABN {abn}</p>}
          </div>

          <div className="flex flex-col gap-9 sm:flex-row sm:gap-10 lg:flex-[2]">
            <FooterCol title="Services" links={SERVICES} />
            <FooterCol title="Support" links={SUPPORT} />
            <FooterCol title="Account" links={ACCOUNT} />
          </div>
        </div>

        <div className="mt-9 flex flex-col justify-between gap-2 border-t border-navy-700 pt-6 text-sm text-sky-100 lg:mt-14 lg:flex-row lg:items-center">
          <p>
            © {year} {name}
          </p>
          <p>All prices in AUD{biz?.gstEnabled === false ? '' : ', GST included'}.</p>
        </div>
      </Container>
    </footer>
  );
}
