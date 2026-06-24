import { useState } from 'react';

export default function AdminLoginModal({ open, onClose, onLogin }) {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div onClick={onClose} className="bc-fade-in absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      <div className="bc-pop relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-6 text-white">
          <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-2xl">🔐</div>
          <h2 className="text-lg font-bold">Admin Login</h2>
          <p className="text-sm text-slate-300">Sign in to manage product inventory.</p>
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 transition hover:text-white" aria-label="Close">✕</button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-6">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[.98] disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-[11px] text-gray-400">Demo admin — admin@gmail.com / 123</p>
        </form>
      </div>
    </div>
  );
}
