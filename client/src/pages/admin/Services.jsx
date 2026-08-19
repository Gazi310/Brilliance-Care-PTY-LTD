import { useEffect, useState } from 'react';
import {
  getLaundryServices,
  createLaundryService,
  updateLaundryService,
  deleteLaundryService,
} from '../../services/laundryService.js';
import LaundryAdminPanel from '../../components/laundry/LaundryAdminPanel.jsx';
import DeliverySlotMenu from '../../components/products/DeliverySlotMenu.jsx';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import { Panel, Button, Notice } from '../../components/ui';
import { AlertIcon, BasketIcon } from '../../components/admin/icons.jsx';
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
      notify('Service updated', 'success');
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
        title="Laundry services"
        subtitle="Add services, set estimated charges, and the per-visit delivery fee."
      />

      {/* Pickup & return availability (admin) — laundry's own calendar */}
      <Panel title="Pickup &amp; return availability" padded className="mb-5">
        <DeliverySlotMenu
          isAdmin
          scope="laundry"
          icon={<BasketIcon />}
          label="Pickup & return availability"
          accent="pickup"
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
        <LaundryAdminPanel
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
