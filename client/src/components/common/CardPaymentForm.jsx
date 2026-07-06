import { useState } from 'react';

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

  const inputCls =
    'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30';

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Pay with card</p>
        <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-bold text-muted">🔒 Secure</span>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <label htmlFor="pay-number" className="mb-1.5 block text-xs font-bold text-muted">Card number</label>
          <input
            id="pay-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={number}
            onChange={(e) => setNumber(formatNumber(e.target.value))}
            className={inputCls}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pay-expiry" className="mb-1.5 block text-xs font-bold text-muted">Expiry</label>
            <input
              id="pay-expiry"
              type="text"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label htmlFor="pay-cvc" className="mb-1.5 block text-xs font-bold text-muted">CVC</label>
            <input
              id="pay-cvc"
              type="text"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="•••"
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
              className={inputCls}
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          ⚠️ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal py-3.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Processing…' : buttonLabel || `Pay $${Number(amount || 0).toFixed(2)}`}
      </button>

      <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-center text-[11px] font-semibold text-muted">
        🧪 Test mode — any card details work. Use a number ending in <b>0002</b> to see a decline.
      </p>
    </form>
  );
}
