import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import {
  getCleaningServices,
  createCleaningService,
  updateCleaningService,
  deleteCleaningService,
} from '../services/cleaningService.js';
import CleaningServiceCard from '../components/cleaning/CleaningServiceCard.jsx';
import CleaningAdminPanel from '../components/cleaning/CleaningAdminPanel.jsx';
import CartDrawer from '../components/products/CartDrawer.jsx';
import ToastStack from '../components/products/ToastStack.jsx';

export default function CleaningServices() {
  const { isAdmin } = useAuth();
  const { addCleaning, count } = useCart();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  const [cartOpen, setCartOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const load = async () => {
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

  const handleAdd = (service) => {
    addCleaning(service);
    notify(`${service.name} added — choose your appointment in your cart`, 'success');
  };

  const handleSave = async (id, fields) => {
    setSavingId(id);
    try {
      await updateCleaningService(id, fields);
      await load();
      notify('Service updated ✅', 'success');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSavingId(null);
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteCleaningService(id);
      await load();
      notify('Service removed.', 'info');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const handleCreate = async (fields) => {
    try {
      await createCleaningService(fields);
      await load();
      notify('Service added 🎉', 'success');
    } catch (err) {
      notify(err.message, 'error');
      throw err;
    }
  };

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Hero */}
      <section className="mx-auto mb-6 max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
          <h1 className="text-2xl font-extrabold sm:text-3xl">Cleaning Services</h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-100 sm:text-base">
            Pick the services you need, then choose an <span className="font-semibold text-white">appointment</span> time in
            your cart. Book your cleaning at the same slot as a shop delivery or laundry pickup and you’re only charged
            delivery once — we make a single trip.
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
            {!isAdmin && (
              <button onClick={() => setCartOpen(true)} className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-fuchsia-500/25 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95">
                <span className="text-lg">🛒</span> Cart
                {count > 0 && <span className="bc-pop absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs font-bold text-white ring-2 ring-white">{count}</span>}
              </button>
            )}
            {isAdmin && (
              <button onClick={() => setAdminPanelOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95">
                <span className="text-lg">🫧</span> Manage services
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </button>
            )}
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
            <p className="text-sm">{isAdmin ? 'Add services from “Manage services”.' : 'Please check back soon.'}</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> {filtered.length === 1 ? 'service' : 'services'}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s, i) => (
                <CleaningServiceCard key={s._id} service={s} index={i} mounted={mounted} onAdd={handleAdd} canBook={!isAdmin} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Overlays */}
      {!isAdmin && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} notify={notify} />}
      {isAdmin && (
        <CleaningAdminPanel
          open={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          services={services}
          onSave={handleSave}
          onDelete={handleDelete}
          onCreate={handleCreate}
          savingId={savingId}
          notify={notify}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
