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
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
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
      notify('Inventory updated ✅', 'success');
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
      notify('Product added 🎉', 'success');
    } catch (err) {
      notify(err.message, 'error');
      throw err;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Manage"
        title="Shop inventory"
        subtitle="Manage product photos, stock, price and availability."
      />

      {/* Delivery-slot availability (admin) */}
      <div className="mb-5 rounded-2xl border border-line bg-white p-4 shadow-soft">
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-faint">
          Delivery availability
        </p>
        <DeliverySlotMenu isAdmin scope="shop" selected={deliverySlot} onSelect={setDeliverySlot} notify={notify} />
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
        <AdminPanel
          inline
          products={products}
          onSave={handleSave}
          onDelete={handleDelete}
          onCreate={handleCreate}
          savingId={savingId}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
