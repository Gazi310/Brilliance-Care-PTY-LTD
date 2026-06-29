import { Link } from 'react-router-dom';
import loginSectionBg from '../../assets/login-section-bg-img.jpg';
import TabsSection from '../common/TabsSection';

export default function Main() {
  return (
    <main className="flex-1 bg-gray-100 p-6 min-h-screen">

      {/* HERO */}
      <section
        className="relative flex min-h-[22rem] items-center justify-center overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat px-6 py-16 text-center"
        style={{ backgroundImage: `url(${loginSectionBg})` }}
      >
        {/* dark overlay for readability over the background image */}
        <div className="pointer-events-none absolute inset-0 bg-slate-900/60" />

        <div className="bc-fade-up relative z-10 max-w-2xl text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="bc-float">🧺</span> Brilliance Care
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Fresh, clean &amp; effortless
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-blue-100/90">
            Premium laundry and cleaning services delivered to your door. Manage
            your orders and bookings with ease.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/laundry"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              Explore Services
            </Link>
            <Link
              to="/products"
              className="rounded-xl bg-white/95 px-6 py-3 text-sm font-bold text-gray-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            >
              Shop Products
            </Link>
          </div>
        </div>
      </section>

      <TabsSection />

    </main>
  );
}
