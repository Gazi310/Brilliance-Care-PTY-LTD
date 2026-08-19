import { useState } from 'react';
import { AlertIcon, FlaskIcon, LockIcon } from '../booking/icons.jsx';
import { Button, Field } from '../ui';

/**
 * The shared "pay with card" block — MOCK provider.
 *
 * Used for both the booking deposit (Checkout) and the invoice balance
 * (/account/invoices/:id). When a real card gateway lands, only this file and
 * the server's utils/payments.js change — swap the inputs for the gateway's
 * hosted fields and call its confirm API inside onPay.
 * Any card number works in mock mode; ending in 0002 simulates a decline.
 *
 * @param {number}   amount      dollars to charge
 * @param {Function} onPay       async ({number, expiry, cvc}) → throws on failure
 * @param {boolean}  busy        disables the button while a charge is in flight
 * @param {string}   buttonLabel e.g. "Pay $28.50 deposit" (default: "Pay $X")
 */
export default function CardPaymentForm({ amount, onPay, busy, buttonLabel }) {
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const formatNumber = (v) =>
    v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onPay({ number, expiry, cvc });
    } catch (err) {
      setError(err.message || 'Payment failed — please try again.');
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bc-card-light rounded-card border border-line bg-white p-6 shadow-card lg:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="bc-eyebrow">Pay with card</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold leading-none text-navy-700">
          <LockIcon width={13} height={13} aria-hidden="true" />
          Secure
        </span>
      </div>

      <div className="mt-4 space-y-4">
        <Field
          id="pay-number"
          label="Card number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 5678 9012 3456"
          value={number}
          onChange={(e) => setNumber(formatNumber(e.target.value))}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Field
            id="pay-expiry"
            label="Expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            required
          />
          <Field
            id="pay-cvc"
            label="CVC"
            type="text"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="•••"
            maxLength={4}
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
            required
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-start gap-2.5 rounded-btn bg-bad-bg px-4 py-3 text-[13px] font-semibold text-bad">
          <AlertIcon width={16} height={16} className="mt-px flex-none" aria-hidden="true" />
          {error}
        </p>
      )}

      <Button variant="gold" type="submit" block disabled={busy} className="mt-5">
        {busy ? 'Processing…' : buttonLabel || `Pay $${Number(amount || 0).toFixed(2)}`}
      </Button>

      <p className="mt-4 flex items-start gap-2.5 rounded-btn bg-sky-50 px-4 py-3 text-xs font-semibold text-muted">
        <FlaskIcon width={15} height={15} className="mt-px flex-none text-navy-500" aria-hidden="true" />
        <span>
          Test mode — any card details work. Use a number ending in <b className="font-bold text-navy-900">0002</b> to
          see a decline.
        </span>
      </p>
    </form>
  );
}
