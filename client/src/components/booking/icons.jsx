/* ------------------------------------------------------------------ */
/*  Booking-flow icons — inline stroke SVGs, 20px, inherit currentColor. */
/*                                                                      */
/*  Phase 6 retires the emoji the booking flow was built on             */
/*  (🧺 🫧 ✨ 🛏 🛁 💡 🧾 🔐 🔒 🧪 ⚠️). Emoji render differently on every   */
/*  platform, can't be recoloured to the navy/gold palette, and the     */
/*  client named them as looking unfinished. Same shape and stroke      */
/*  weight as home/icons.jsx and products/icons.jsx so the whole app    */
/*  draws from one set.                                                 */
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

/** Laundry basket — the laundry service, and the laundry-pickup slot. */
export const BasketIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3.6 9h16.8l-1.5 9.3a2 2 0 0 1-2 1.7H7.1a2 2 0 0 1-2-1.7L3.6 9z" />
    <path d="M8.4 9a3.6 3.6 0 0 1 7.2 0" />
    <path d="M9.4 12.6v4M14.6 12.6v4" />
  </svg>
);

/** Bubbles — the cleaning service, and the cleaning appointment slot. */
export const BubblesIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="9.5" cy="14" r="5" />
    <circle cx="16.8" cy="8.2" r="3.2" />
    <circle cx="18" cy="16.6" r="2" />
  </svg>
);

/** Sparkle — add-on extras, and the "freshly returned" laundry slot. */
export const SparkleIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M10 3.5l1.5 4.1 4.1 1.5-4.1 1.5L10 14.7 8.5 10.6 4.4 9.1l4.1-1.5L10 3.5z" />
    <path d="M17.5 14.5l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z" />
  </svg>
);

export const BedIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3 5.5v13" />
    <path d="M3 9.5h15a2.5 2.5 0 0 1 2.5 2.5v6.5" />
    <path d="M3 15.5h17.5" />
    <path d="M7.2 9.5v6" />
  </svg>
);

export const BathIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 11.5V5.6a1.6 1.6 0 0 1 2.7-1.2L8.8 6" />
    <path d="M2.5 11.5h19v3.2a4 4 0 0 1-4 4h-11a4 4 0 0 1-4-4v-3.2z" />
    <path d="M6.5 18.7l-1 2.3M17.5 18.7l1 2.3" />
  </svg>
);

/** Receipt — the "we invoice the balance after service" explainer. */
export const ReceiptIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 3h12v17l-3-2-3 2-3-2-3 2z" />
    <path d="M9.5 8h5M9.5 12h5" />
  </svg>
);

/** Padlock — "secure payment" and "you'll be asked to sign in". */
export const LockIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="4.5" y="10.3" width="15" height="9.7" rx="2.2" />
    <path d="M8 10.3V7.7a4 4 0 0 1 8 0v2.6" />
  </svg>
);

/** Flask — the mock-gateway test-mode note. */
export const FlaskIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9.8 3h4.4" />
    <path d="M10.6 3v6.4L5.7 18a2 2 0 0 0 1.7 3h9.2a2 2 0 0 0 1.7-3l-4.9-8.6V3" />
    <path d="M8.3 15h7.4" />
  </svg>
);

export const AlertIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5l9 16H3l9-16z" />
    <path d="M12 10v4M12 17.2v.4" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M4 12l5 5L20 6" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
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

export const ArrowRightIcon = (p) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
