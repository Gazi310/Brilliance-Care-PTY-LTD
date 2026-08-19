import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Field } from '../ui';
import AuthError from './AuthError.jsx';

/**
 * Sign in.
 *
 * No "keep me signed in" checkbox even though the wireframe sketches one:
 * the token goes to localStorage either way, so the control would do
 * nothing. It comes back the day there's a session-only mode to toggle.
 */
export default function LoginForm({ onDone }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
      onDone();
    } catch (err) {
      setError(err.message || 'Log in failed. Please check your details and try again.');
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <h1 className="bc-h2">Welcome back</h1>
      <p className="bc-body mt-2 text-muted">
        Your addresses and preferences are already saved.
      </p>

      <div className="mt-6 space-y-4">
        <Field
          id="login-email"
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          id="login-password"
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="mt-3.5 flex justify-end">
        <Button to="/contact" variant="ghost" className="text-sm">
          Forgot password?
        </Button>
      </div>

      {error && (
        <div className="mt-5">
          <AuthError>{error}</AuthError>
        </div>
      )}

      <Button variant="gold" type="submit" block disabled={busy} className="mt-6">
        {busy ? 'Signing in…' : 'Log in'}
      </Button>

      <p className="bc-meta mt-5 text-center text-muted">
        Demo admin — admin@gmail.com / 123
      </p>
    </form>
  );
}
