/* ------------------------------------------------------------------ */
/*  Shop icons — inline stroke SVGs, 20px, inherit currentColor.       */
/*                                                                      */
/*  These exist to retire the emoji the shop was built on (🛒 🚚 🔎 🧴). */
/*  Emoji render differently on every platform, can't be recoloured to  */
/*  match the palette, and the client named them as looking unfinished. */
/* ------------------------------------------------------------------ */
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/** Delivery van — the flat-fee notice that appears on all three shop pages. */
export const TruckIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17.5" cy="18" r="1.6" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const CartIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 4h2.2l2.2 10.4a1.6 1.6 0 0 0 1.6 1.3h7.8a1.6 1.6 0 0 0 1.6-1.2L20 8H6" />
    <circle cx="9.5" cy="19.5" r="1.4" />
    <circle cx="17" cy="19.5" r="1.4" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M4 12l5 5L20 6" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const AlertIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5l9 16H3l9-16z" />
    <path d="M12 10v4M12 17.2v.4" />
  </svg>
);

export const InfoIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.6v.6" />
  </svg>
);

export const ChevronLeftIcon = (p) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M15 5.5L8.5 12l6.5 6.5" />
  </svg>
);

export const ChevronRightIcon = (p) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M9 5.5L15.5 12 9 18.5" />
  </svg>
);

/* --- Delivery / pickup time windows, used by SlotCalendar. --------- */
/*  These replace the 🌅 🌤️ 🌙 emoji: at 16px the emoji were the only   */
/*  full-colour objects on an otherwise navy-and-gold surface.         */

/** Morning — sun rising over a horizon line. */
export const SunriseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 4v3" />
    <path d="M5.8 9.8l2 2M18.2 9.8l-2 2" />
    <path d="M8 17a4 4 0 0 1 8 0" />
    <path d="M3 17h2.5M18.5 17H21" />
    <path d="M3 21h18" />
  </svg>
);

/** Afternoon — sun at full height. */
export const SunIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1" />
    <path d="M5.5 5.5l1.5 1.5M17 17l1.5 1.5M18.5 5.5L17 7M7 17l-1.5 1.5" />
  </svg>
);

/** Evening — crescent moon. */
export const MoonIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20.2 14.8A8.4 8.4 0 0 1 9.2 3.8a8.6 8.6 0 1 0 11 11z" />
  </svg>
);

/** Filled star for product ratings. Gold as a *fill* — never as text. */
export const StarIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} {...p}>
    <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7L12 2z" />
  </svg>
);
