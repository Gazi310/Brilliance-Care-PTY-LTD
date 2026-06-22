import { useState, useEffect } from 'react';
import loginSectionBg from '../../assets/login-section-bg-img.jpg';

export default function Main() {
  // triggers the entrance animation once the component mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="flex-1 bg-gray-100 p-6 min-h-screen">

      <section
        className="login-section relative flex gap-4 items-center justify-around overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat px-6 py-16"
        style={{ backgroundImage: `url(${loginSectionBg})` }}
      >

        {/* dark overlay for readability over the background image */}
        <div className="pointer-events-none absolute inset-0 bg-slate-900/60" />

        {/* LOGIN CARD */}
        <div
          className={`relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg
            transition duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl
            ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
              🧺
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
          </div>

          <form className="space-y-5">

            <div className="relative">
              <input
                type="email"
                placeholder=" "
                className="peer w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs">
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder=" "
                className="peer w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs">
                Password
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder=" "
                className="peer w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              />
              <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs">
                Suburb
              </label>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-500">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400" />
                Remember me
              </label>
              <a href="#" className="font-medium text-blue-600 transition-colors hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/40 active:translate-y-0 active:bg-blue-800"
            >
              Sign In
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
              Sign up
            </a>
          </p>
        </div>

        {/* RIGHT SIDE (div2 placeholder) */}
        <div
          className={`relative z-10 hidden max-w-sm text-white md:block
            transition duration-500 ease-out [transition-delay:150ms]
            ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
        >
          <h3 className="text-3xl font-bold leading-tight">
            Welcome back 👋
          </h3>
          <p className="mt-4 text-base text-blue-100/90">
            Fresh, clean laundry is just a sign-in away. Manage your orders and bookings with ease.
          </p>
        </div>

      </section>

      <section className="services-section flex gap-4 items-center justify-around">
        services-section
      </section>

      <section className="product-section flex gap-4 items-center justify-around">
        product-section
      </section>

    </main>
  );
}