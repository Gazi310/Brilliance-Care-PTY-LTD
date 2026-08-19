import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Field } from '../ui';
import AuthError from './AuthError.jsx';

/**
 * Create an account.
 *
 * First and last name are two inputs but one stored `name` — the rest of
 * the app (greeting, admin customer list, invoice "billed to") wants a
 * display name, and splitting the schema to reassemble it everywhere
 * would buy nothing. Two boxes is just what people expect to type into.
 *
 * The mobile number is the field that earns its place: guest bookings
 * are matched to customers by phone, so capturing it here is what lets
 * someone claim a job they booked before signing up.
 */
export default function RegisterForm({ onDone }) {
  const { register } = useAuth();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register({
        name: `${first.trim()} ${last.trim()}`.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      onDone();
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <h1 className="bc-h2">Create your account</h1>
      <p className="bc-body mt-2 text-muted">
        Takes about thirty seconds. You can also book as a guest and claim it later.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="reg-first"
          label="First name"
          name="firstName"
          autoComplete="given-name"
          placeholder="Priya"
          required
          value={first}
          onChange={(e) => setFirst(e.target.value)}
        />
        <Field
          id="reg-last"
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          placeholder="Mehta"
          required
          value={last}
          onChange={(e) => setLast(e.target.value)}
        />
        <Field
          id="reg-email"
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          wrapperClassName="sm:col-span-2"
        />
        <Field
          id="reg-phone"
          label="Mobile"
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          placeholder="04XX XXX XXX"
          hint="So the driver can text you when they're on the way."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          wrapperClassName="sm:col-span-2"
        />
        <Field
          id="reg-password"
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="Eight characters or more. A phrase works better than a word."
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          wrapperClassName="sm:col-span-2"
        />
      </div>

      <label className="mt-[18px] flex cursor-pointer select-none items-center gap-[9px] text-sm font-medium text-ink">
        <input
          type="checkbox"
          required
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="h-[17px] w-[17px] flex-none cursor-pointer accent-gold-500"
        />
        I accept the terms and privacy policy
      </label>

      {error && (
        <div className="mt-5">
          <AuthError>{error}</AuthError>
        </div>
      )}

      <Button variant="gold" type="submit" block disabled={busy || !accepted} className="mt-[22px]">
        {busy ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
