import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import Button from '../ui/Button.jsx';

/**
 * "Do you come to me?" — the postcode check.
 *
 * Appears twice on the homepage (hero and service-area band), which is
 * why it's its own component: the two used to be one hand-rolled form
 * and one copy of it. Pass a unique `id` — two inputs sharing an id
 * would break both labels.
 *
 * The check itself is unchanged from v1 and still correct: when the
 * admin has saved a service-area list in /admin/settings it's a real
 * membership test; with an empty list any valid 4-digit AU postcode
 * passes, so the field never blocks a booking on a fresh install.
 */
export default function PostcodeCheck({
  id = 'postcode',
  label = 'Postcode',
  placeholder = 'Enter your postcode',
  cta = 'Check my area',
  className = '',
}) {
  const settings = useSettings();
  const [postcode, setPostcode] = useState('');
  const [result, setResult] = useState(null); // null | 'ok' | 'out' | 'invalid'

  const serviceCodes = settings?.servicePostcodes || [];

  const check = (e) => {
    e.preventDefault();
    const pc = postcode.trim();
    if (!/^\d{4}$/.test(pc)) return setResult('invalid');
    if (serviceCodes.length > 0 && !serviceCodes.includes(pc)) return setResult('out');
    setResult('ok');
  };

  const MESSAGES = {
    ok: [`Good news — we service ${postcode}. Get your estimate below.`, 'text-ok'],
    out: [`We're not in ${postcode} just yet — we're expanding, so check back soon.`, 'text-warn'],
    invalid: ['Please enter a valid 4-digit Australian postcode.', 'text-warn'],
  };

  return (
    <div className={className}>
      <form onSubmit={check} className="flex max-w-[520px] flex-col gap-3 lg:flex-row">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          inputMode="numeric"
          maxLength={4}
          value={postcode}
          onChange={(e) => {
            setPostcode(e.target.value.replace(/\D/g, ''));
            setResult(null);
          }}
          placeholder={placeholder}
          className="h-[58px] w-full min-w-0 rounded-btn border border-line bg-white px-[18px] text-base text-ink placeholder:text-[#93a4b3] lg:flex-1 lg:text-[17px]"
        />
        {/* h-58 matches the input; the button's own vertical padding is
            harmless inside a fixed height and keeps the label centred. */}
        <Button type="submit" variant="gold" className="h-[58px] flex-none">
          {cta}
        </Button>
      </form>

      {result && (
        <p
          role="status"
          className={`bc-fade-in bc-meta mt-3 font-semibold ${MESSAGES[result][1]}`}
        >
          {MESSAGES[result][0]}
        </p>
      )}
    </div>
  );
}
