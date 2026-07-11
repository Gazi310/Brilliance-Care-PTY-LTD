import { useEffect, useState } from 'react';
import {
  getLaundryServices,
  createLaundryService,
  updateLaundryService,
  deleteLaundryService,
} from '../../services/laundryService.js';
import LaundryAdminPanel from '../../components/laundry/LaundryAdminPanel.jsx';
import DeliverySlotMenu from '../../components/products/DeliverySlotMenu.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import ToastStack from '../../components/products/ToastStack.jsx';

/**
 * /admin/services — manage laundry services and the delivery fee.
 * Access is handled by the AdminLayout shell (PrivateRoute requireAdmin).
 */
export default function AdminServices() {
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
    load();
  }, []);

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Manage"
        title="Laundry services"
        subtitle="Add services, set estimated charges, and the per-visit delivery fee."
      />

      {/* Pickup & return availability (admin) — laundry's own calendar */}
      <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-soft">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-faint">
          Pickup &amp; return availability
        </p>
        <DeliverySlotMenu
          isAdmin
          scope="laundry"
          icon="🧺"
          label="Pickup & return availability"
          accent="sky"
          selected={null}
          onSelect={() => {}}
          notify={notify}
        />
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

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
