import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FloatingInput from '../components/common/FloatingInput.jsx';
import loginSectionBg from '../assets/login-section-bg-img.jpg';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cover bg-center bg-no-repeat p-6"
      style={{ backgroundImage: `url(${loginSectionBg})` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-slate-900/60" />

      <div className="bc-fade-up relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl text-white shadow-lg shadow-blue-500/30">
            ✨
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Join Brilliance Care in a few seconds
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <FloatingInput
            type="text"
            label="Full name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FloatingInput
            type="email"
            label="Email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FloatingInput
            type="password"
            label="Password"
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
