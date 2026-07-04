import { useEffect, useState } from 'react';
import {
  getCleaningServices,
  createCleaningService,
  updateCleaningService,
  deleteCleaningService,
} from '../../services/cleaningService.js';
import CleaningAdminPanel from '../../components/cleaning/CleaningAdminPanel.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import ToastStack from '../../components/products/ToastStack.jsx';

/**
 * /admin/cleaning — manage cleaning services and the delivery fee.
 * Access is handled by the AdminLayout shell (PrivateRoute requireAdmin).
 */
export default function AdminCleaning() {
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
      const data = await getCleaningServices();
      setServices(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Manage"
        title="Cleaning services"
        subtitle="Add services, set estimated charges, and the per-visit delivery fee."
      />

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
        <CleaningAdminPanel
          inline
          services={services}
          onSave={handleSave}
          onDelete={handleDelete}
          onCreate={handleCreate}
          savingId={savingId}
          notify={notify}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
