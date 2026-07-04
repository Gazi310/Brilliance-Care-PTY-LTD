import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import { getCleaningServices } from '../services/cleaningService.js';
import CleaningServiceCard from '../components/cleaning/CleaningServiceCard.jsx';

export default function CleaningServices() {
  const navigate = useNavigate();
  const { setCleaningService, setAddonQty } = useBooking();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCleaningServices();
      setServices(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setMounted(true);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getCleaningServices();
        if (active) {
          setServices(data);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) {
          setLoading(false);
          setMounted(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
  }, [services, search]);

  // "Book" jumps into the guided flow with this service pre-selected.
  // Add-ons pre-select as an extra; main services become the cleaning type.
  const handleAdd = (service) => {
    if (service.isAddon) setAddonQty(service._id, 1);
    else setCleaningService(service._id);
    navigate('/book/cleaning');
  };

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:pb-6">
      {/* Hero */}
      <section className="mx-auto mb-6 max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
          <h1 className="text-2xl font-extrabold sm:text-3xl">Cleaning Services</h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-100 sm:text-base">
            Pick a clean and we'll size the price to your home — bedrooms, bathrooms and any extras. You'll see
            an <span className="font-semibold text-white">estimate</span>, pay a small deposit to book, and settle
            the balance after your service.
          </p>
        </div>
      </section>

      {/* Search + actions */}
      <section className="mx-auto mb-8 max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search cleaning services…" className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/book/cleaning')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              🫧 Book a clean
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {error}
            <button onClick={load} className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md">
                <div className="bc-skeleton h-40" />
                <div className="space-y-3 p-5"><div className="bc-skeleton h-4 w-3/4 rounded" /><div className="bc-skeleton h-3 w-full rounded" /><div className="bc-skeleton h-8 w-1/3 rounded" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
            <span className="text-6xl">🫧</span>
            <p className="mt-4 text-lg font-semibold text-gray-500">No cleaning services found</p>
            <p className="text-sm">Please check back soon.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> {filtered.length === 1 ? 'service' : 'services'}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s, i) => (
                <CleaningServiceCard key={s._id} service={s} index={i} mounted={mounted} onAdd={handleAdd} canBook />
              ))}
            </div>
          </>
        )}
      </section>

    </main>
  );
}
