import { Link } from 'react-router-dom';

/**
 * BrandMark — the logo lockup, shared by the header, footer and admin bar.
 *
 * One component because the three used to drift: the header had a
 * rounded-square gradient tile, the footer an aqua-to-mint one, and
 * admin a third variant. v2 is a white disc with a gold star and the
 * wordmark stacked beside it, everywhere.
 *
 * `notch` is the header's signature move — a negative bottom margin
 * that lets the disc hang below the navy bar's bottom edge. It only
 * works if no ancestor clips overflow.
 */
export default function BrandMark({
  to = '/',
  size = 'default',
  notch = false,
  wordmark = true,
  className = '',
  onClick,
}) {
  const sm = size === 'sm';

  const inner = (
    <>
      <span
        className={`relative z-[2] grid flex-none place-items-center rounded-full bg-white shadow-[0_6px_18px_rgba(0,0,0,.25)] ${
          sm ? 'h-9 w-9' : 'h-[42px] w-[42px] lg:h-14 lg:w-14'
        } ${notch ? '-mb-3.5 lg:-mb-6' : ''}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`text-gold-500 ${sm ? 'h-5 w-5' : 'h-[22px] w-[22px] lg:h-[30px] lg:w-[30px]'}`}
          aria-hidden="true"
        >
          <path d="M12 2l2.6 6.5L21 11l-6.4 2.5L12 20l-2.6-6.5L3 11l6.4-2.5z" />
        </svg>
      </span>

      {wordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-[0.02em] ${sm ? 'text-[13px]' : 'text-sm lg:text-base'}`}
          >
            BRILLIANCE CARE
          </span>
          <span
            className={`mt-[3px] font-medium text-sky-100 ${
              sm ? 'text-[9px] tracking-[0.1em]' : 'text-[9px] tracking-[0.1em] lg:text-[10.5px] lg:tracking-[0.14em]'
            }`}
          >
            LAUNDRY &amp; CLEANING
          </span>
        </span>
      )}
    </>
  );

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label="Brilliance Care home"
      className={`flex flex-none items-center gap-3 text-white ${className}`}
    >
      {inner}
    </Link>
  );
}
