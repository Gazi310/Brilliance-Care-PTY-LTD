import { useEffect, useState } from 'react';
import {
  getCleaningServices,
  createCleaningService,
  updateCleaningService,
  deleteCleaningService,
} from '../../services/cleaningService.js';
import CleaningAdminPanel from '../../components/cleaning/CleaningAdminPanel.jsx';
import DeliverySlotMenu from '../../components/products/DeliverySlotMenu.jsx';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import { Panel, Button, Notice } from '../../components/ui';
import { AlertIcon, BubblesIcon } from '../../components/admin/icons.jsx';
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
      notify('Service updated', 'success');
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
      notify('Service added', 'success');
    } catch (err) {
      notify(err.message, 'error');
      throw err;
    }
  };

  return (
    <AdminPage width="narrow">
      <AdminSectionHeader
        eyebrow="Manage"
        title="Cleaning services"
        subtitle="Add services, set estimated charges, and the per-visit delivery fee."
      />

      {/* Appointment availability (admin) — cleaning's own calendar */}
      <Panel title="Appointment availability" padded className="mb-5">
        <DeliverySlotMenu
          isAdmin
          scope="cleaning"
          icon={<BubblesIcon />}
          label="Appointment availability"
          accent="cleaning"
          selected={null}
          onSelect={() => {}}
          notify={notify}
        />
      </Panel>

      {error && (
        <Notice tone="warn" className="mb-5" icon={<AlertIcon className="mt-0.5 flex-none" />}>
          <p>{error}</p>
          <Button variant="ghost" onClick={load} className="mt-2">
            Retry
          </Button>
        </Notice>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bc-skeleton h-28 rounded-card" />
          ))}
        </div>
      ) : (
        <CleaningAdminPanel
          services={services}
          onSave={handleSave}
          onDelete={handleDelete}
          onCreate={handleCreate}
          savingId={savingId}
          notify={notify}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </AdminPage>
  );
}
