import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import {
  getProducts,
  updateProduct,
  createProduct,
  deleteProduct,
} from '../../services/productService.js';
import AdminPanel from '../../components/products/AdminPanel.jsx';
import DeliverySlotMenu from '../../components/products/DeliverySlotMenu.jsx';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import { Panel, Button, Notice } from '../../components/ui';
import { AlertIcon, TruckIcon } from '../../components/admin/icons.jsx';
import ToastStack from '../../components/products/ToastStack.jsx';

/**
 * /admin/products — manage shop inventory and delivery-slot availability.
 * Access is handled by the AdminLayout shell (PrivateRoute requireAdmin).
 */
export default function AdminProducts() {
  const { deliverySlot, setDeliverySlot } = useCart();

  const [products, setProducts] = useState([]);
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
      const data = await getProducts();
      setProducts(data);
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
      await updateProduct(id, fields);
      await load();
      notify('Inventory updated', 'success');
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSavingId(null);
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      await load();
      notify('Product removed.', 'info');
    } catch (err) {
      notify(err.message, 'error');
    }
  };
  const handleCreate = async (fields) => {
    try {
      await createProduct(fields);
      await load();
      notify('Product added', 'success');
    } catch (err) {
      notify(err.message, 'error');
      throw err;
    }
  };

  return (
    <AdminPage width="narrow">
      <AdminSectionHeader
        eyebrow="Manage"
        title="Shop inventory"
        subtitle="Manage product photos, stock, price and availability."
      />

      {/* Delivery-slot availability (admin) */}
      <Panel title="Delivery availability" padded className="mb-5">
        <DeliverySlotMenu
          isAdmin
          scope="shop"
          icon={<TruckIcon />}
          accent="admin"
          selected={deliverySlot}
          onSelect={setDeliverySlot}
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
        <AdminPanel
          products={products}
          onSave={handleSave}
          onDelete={handleDelete}
          onCreate={handleCreate}
          savingId={savingId}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </AdminPage>
  );
}
