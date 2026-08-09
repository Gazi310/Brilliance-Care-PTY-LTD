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

/** Filled star for product ratings. Gold as a *fill* — never as text. */
export const StarIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} {...p}>
    <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7L12 2z" />
  </svg>
);
