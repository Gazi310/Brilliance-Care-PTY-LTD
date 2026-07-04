import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getLaundryServices,
  createLaundryService,
  updateLaundryService,
  deleteLaundryService,
} from '../../services/laundryService.js';
import LaundryAdminPanel from '../../components/laundry/LaundryAdminPanel.jsx';
import ToastStack from '../../components/products/ToastStack.jsx';

/**
 * /admin/services — dedicated admin area for managing laundry services and the
 * delivery fee. Replaces the inline admin panel that used to live on /laundry.
 * Guarded: only signed-in admins may view it.
 */
export default function AdminServices() {
  const { isAdmin, loading: authLoading } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLaundryServices();
      setServices(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const handleSave = async (id, fields) => {
    setSavingId(id);
    try {
      await updateLaundryService(id, fields);
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
      await deleteLaundryService(id);
      await load();
      notify('Service removed.', 'info');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const handleCreate = async (fields) => {
    try {
      await createLaundryService(fields);
      await load();
      notify('Service added 🎉', 'success');
    } catch (err) {
      notify(err.message, 'error');
      throw err;
    }
  };

  // Wait for the session to resolve before deciding access (avoids a flash-redirect on refresh).
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </main>
    );
  }
  if (!isAdmin) return <Navigate to="/login" replace />;

  return (
    <main className="min-h-screen bg-surface pb-16">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-faint">Admin</p>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Laundry services</h1>
            <p className="mt-1 text-sm text-muted">Add services, set estimated charges, and the per-visit delivery fee.</p>
          </div>
          <Link
            to="/laundry"
            className="inline-flex flex-none items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-bold text-navy shadow-soft transition hover:-translate-y-0.5"
          >
            View page
            <span className="text-base leading-none">→</span>
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {error}
            <button onClick={load} className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bc-skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <LaundryAdminPanel
            inline
            services={services}
            onSave={handleSave}
            onDelete={handleDelete}
            onCreate={handleCreate}
            savingId={savingId}
            notify={notify}
          />
        )}
      </div>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
