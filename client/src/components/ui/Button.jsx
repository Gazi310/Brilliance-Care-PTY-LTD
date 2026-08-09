import { Link } from 'react-router-dom';

/**
 * Button — the single source of truth for every action in the app.
 *
 * Renders as <button>, <Link> (pass `to`) or <a> (pass `href`)
 * depending on what you give it, so a CTA never has to be styled
 * twice for the two cases.
 *
 * VARIANTS, and when each one is right:
 *   gold    the one thing you want them to do on this screen
 *   navy    a solid secondary action, or the primary one on a light
 *           band where gold would be too loud next to another gold
 *   outline every other real action — this is the workhorse
 *   ghost   underlined text link; "learn more", "cancel", "back"
 *
 * ONE GOLD BUTTON PER VIEWPORT. If a screen has three gold CTAs,
 * gold has stopped meaning anything. Demote two to outline.
 */

const VARIANTS = {
  gold: 'bg-gold-500 text-navy-900 hover:bg-gold-600',
  navy: 'bg-navy-900 text-white hover:bg-navy-800',
  outline:
    'bg-transparent text-navy-900 shadow-[inset_0_0_0_2px_var(--color-navy-900)] hover:bg-navy-900/5 ' +
    // On a navy band the outline has to invert or it disappears.
    '[.bc-on-navy_&]:text-white [.bc-on-navy_&]:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.5)] [.bc-on-navy_&]:hover:bg-white/10',
  ghost:
    'bg-transparent p-0 font-bold text-navy-500 underline decoration-2 underline-offset-4 hover:text-navy-900 ' +
    '[.bc-on-navy_&]:text-sky-100 [.bc-on-navy_&]:hover:text-white',
};

const SIZES = {
  default: 'text-[15px] px-[22px] py-4 lg:text-base lg:px-[26px] lg:py-[17px]',
  sm: 'text-sm px-[18px] py-3',
  lg: 'text-base px-8 py-5',
};

export default function Button({
  variant = 'outline',
  size = 'default',
  pill = false,
  block = false,
  to,
  href,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const isGhost = variant === 'ghost';

  const classes = [
    'inline-flex items-center justify-center gap-2.5 border-0 font-bold leading-none no-underline transition-[background-color,color,box-shadow] duration-150 cursor-pointer',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant] ?? VARIANTS.outline,
    // Ghost sets its own padding to zero and has no radius to speak of.
    isGhost ? '' : SIZES[size] ?? SIZES.default,
    isGhost ? '' : pill ? 'rounded-full lg:px-[42px]' : 'rounded-btn',
    block ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
