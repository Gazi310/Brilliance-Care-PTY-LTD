import { AlertIcon } from '../booking/icons.jsx';

/** Inline form error — same treatment as the one in CardPaymentForm. */
export default function AuthError({ children }) {
  if (!children) return null;

  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-btn bg-bad-bg px-4 py-3 text-[13px] font-semibold text-bad"
    >
      <AlertIcon width={16} height={16} className="mt-px flex-none" aria-hidden="true" />
      {children}
    </p>
  );
}
