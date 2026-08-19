/* ------------------------------------------------------------------ */
/*  Admin icons — inline stroke SVGs, 20px, inherit currentColor.       */
/*                                                                      */
/*  Phase 8 retires the emoji the admin screens were built on           */
/*  (👤 🏠 🔑 📋 💰 ✉️ 💬 💵 💳 📝 📞 📦 🛍️ ✅ ⚠️ 🔒 ✕). Same base object,      */
/*  viewBox and stroke weight as booking/icons.jsx, home/icons.jsx and  */
/*  products/icons.jsx, so the four sets are visually one set.          */
/*                                                                      */
/*  Only icons that don't already exist elsewhere live here. The        */
/*  laundry/cleaning/receipt/lock/alert/check marks come from           */
/*  booking/icons.jsx — admin re-exports them below so an admin file    */
/*  needs exactly one import line.                                      */
/* ------------------------------------------------------------------ */
export {
  BasketIcon,
  BubblesIcon,
  ReceiptIcon,
  LockIcon,
  AlertIcon,
  CheckIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../booking/icons.jsx';

export { TruckIcon } from '../products/icons.jsx';

import { BasketIcon as Basket, BubblesIcon as Bubbles } from '../booking/icons.jsx';
import { KIND_ICON_NAME } from './orders/orderStatusMeta.js';

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

/** Person — the customer on an order, and the customers section. */
export const UserIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
  </svg>
);

/** House — the service address. */
export const HomeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 10.4L12 4l8 6.4V19a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19v-8.6z" />
    <path d="M9.6 20.4v-6h4.8v6" />
  </svg>
);

/** Key — access notes (lockbox codes, side gates, "dog in the yard"). */
export const KeyIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="15.6" r="3.6" />
    <path d="M10.6 13L19 4.6M16.4 7.2l2.2 2.2M14 9.6l2.2 2.2" />
  </svg>
);

/** Clipboard — special instructions from the customer. */
export const ClipboardIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M9 4.6h6v2.8H9z" />
    <path d="M15 6h2.2A1.8 1.8 0 0 1 19 7.8v10.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 18.2V7.8A1.8 1.8 0 0 1 6.8 6H9" />
    <path d="M8.6 11.4h6.8M8.6 15h4.4" />
  </svg>
);

/** Dollar — estimate, deposit and balance lines. */
export const MoneyIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.4v17.2" />
    <path d="M15.8 7.4a3.4 3.4 0 0 0-3.3-2.2h-.8a3.1 3.1 0 0 0-.5 6.2h1.6a3.1 3.1 0 0 1-.5 6.2h-.8a3.4 3.4 0 0 1-3.3-2.2" />
  </svg>
);

/** Envelope — the email notification channel. */
export const MailIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2" />
    <path d="M3.6 7.2l8.4 5.8 8.4-5.8" />
  </svg>
);

/** Speech bubble — the SMS notification channel. */
export const ChatIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20.4 12.6a7.4 7.4 0 0 1-10.7 6.6L4 20.4l1.3-5.5a7.4 7.4 0 1 1 15.1-2.3z" />
  </svg>
);

/** Banknote — cash settled on delivery. */
export const CashIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="2.8" y="6.4" width="18.4" height="11.2" rx="1.8" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6.2 12h.01M17.8 12h.01" />
  </svg>
);

/** Card — card settled on delivery, and the online payment method. */
export const CardIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="2.8" y="5.6" width="18.4" height="12.8" rx="2" />
    <path d="M2.8 10h18.4M6.4 14.6h3.2" />
  </svg>
);

/** Pencil — an internal note, saved or sent. */
export const PencilIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4.4 19.6l.9-3.7L15.9 5.3a1.9 1.9 0 0 1 2.7 0l1.1 1.1a1.9 1.9 0 0 1 0 2.7L9.1 19.7l-4.7-.1z" />
    <path d="M14.6 6.6l2.8 2.8" />
  </svg>
);

/** Handset — the customer's phone number. */
export const PhoneIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M8.2 4.4l2.1 3.4-1.9 2a11.4 11.4 0 0 0 5.8 5.8l2-1.9 3.4 2.1v3a1.6 1.6 0 0 1-1.8 1.6C10.7 19.6 4.4 13.3 3.6 6.2A1.6 1.6 0 0 1 5.2 4.4h3z" />
  </svg>
);

/** Carton — a shop order, and the shop delivery slot. */
export const BoxIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M3.6 8.2L12 4l8.4 4.2v7.6L12 20l-8.4-4.2V8.2z" />
    <path d="M3.6 8.2L12 12.4l8.4-4.2M12 12.4V20" />
  </svg>
);

/** Shopping bag — the shop section in nav and on shop orders. */
export const BagIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M5.4 7.6h13.2l-1 11.2a1.8 1.8 0 0 1-1.8 1.6H8.2a1.8 1.8 0 0 1-1.8-1.6L5.4 7.6z" />
    <path d="M8.8 7.6V6.2a3.2 3.2 0 0 1 6.4 0v1.4" />
  </svg>
);

/** Cross — remove a line, dismiss a chip. */
export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6.6 6.6l10.8 10.8M17.4 6.6L6.6 17.4" />
  </svg>
);

/** Calendar — schedule windows and slot management. */
export const CalendarIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3.6" y="5.4" width="16.8" height="15" rx="2" />
    <path d="M3.6 10h16.8M8.4 3.4v4M15.6 3.4v4" />
  </svg>
);

/** Gauge — capacity and utilisation readouts. */
export const GaugeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 17.4a8.6 8.6 0 1 1 16 0" />
    <path d="M12 17.4l4-5" />
  </svg>
);

/**
 * Order kind → icon, resolved from the name in orderStatusMeta's
 * KIND_ICON_NAME. The lookup lives here rather than there because that
 * file is plain `.js` and can't hold JSX without breaking Fast Refresh.
 * Shop orders have no `service`, so `bag` is the fallback.
 */
const KIND_ICON = { basket: Basket, bubbles: Bubbles, bag: BagIcon };

/**
 * The right icon for any order — laundry, cleaning or shop.
 *
 * A component rather than a `pickIcon(order)` helper so this file stays
 * components-only and Fast Refresh keeps working; a module that mixes
 * component and non-component exports forces a full reload on every edit.
 */
export const OrderKindIcon = ({ order, ...rest }) => {
  const Icon =
    order?.kind === 'booking' ? KIND_ICON[KIND_ICON_NAME[order.service]] ?? Basket : BagIcon;
  return <Icon {...rest} />;
};
