import { CheckIcon } from '../booking/icons.jsx';
import Notice from '../ui/Notice.jsx';

/**
 * The column beside the form: why an account is worth thirty seconds.
 *
 * Every item is a thing the app actually does — saved addresses prefill
 * the booking step, invoices live under the order, the timeline is real.
 * If one of these stops being true it comes off the list.
 */
const REASONS = [
  {
    title: 'Addresses and access notes saved',
    sub: "No re-typing the lockbox code every time you book.",
  },
  {
    title: 'Every invoice in one place',
    sub: 'The final bill sits under the order it belongs to.',
  },
  {
    title: 'Rebook a past job in one tap',
    sub: 'Same services, same preferences, new date.',
  },
  {
    title: 'Track where your order is',
    sub: 'Live status from pickup through to delivery.',
  },
];

export default function AuthBenefits() {
  return (
    <div>
      <p className="bc-eyebrow">Why bother with an account?</p>
      <h2 className="bc-h2 mt-2.5">Two taps instead of a form</h2>

      <ul className="mt-7 m-0 list-none space-y-[18px] p-0">
        {REASONS.map((r) => (
          <li key={r.title} className="flex gap-3.5">
            <CheckIcon width={20} height={20} className="mt-0.5 flex-none text-ok" aria-hidden="true" />
            <div className="min-w-0">
              <strong className="font-semibold text-navy-900">{r.title}</strong>
              <p className="bc-meta mt-1 text-muted">{r.sub}</p>
            </div>
          </li>
        ))}
      </ul>

      <Notice tone="info" className="mt-7">
        Guest bookings work fine — we match them to your phone number, so you can claim them
        later by signing up with the same number.
      </Notice>
    </div>
  );
}
