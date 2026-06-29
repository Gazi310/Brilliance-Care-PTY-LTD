import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import {
  getProducts,
  updateProduct,
  createProduct,
  deleteProduct,
} from '../services/productService.js';
import { checkout } from '../services/orderService.js';
import ProductCard from '../components/products/ProductCard.jsx';
import CartDrawer from '../components/products/CartDrawer.jsx';
import AdminPanel from '../components/products/AdminPanel.jsx';
import DeliverySlotMenu from '../components/products/DeliverySlotMenu.jsx';
import ToastStack from '../components/products/ToastStack.jsx';

export default function Products() {
  // Admin status is auto-detected from the header login (no separate admin login).
  const { isAdmin } = useAuth();
  const { items, add, clear, count } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState('');

  const [cartOpen, setCartOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // ---- toasts ----
  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // ---- data ----
  const load = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setMounted(true);
    }
  };

  // Initial fetch on mount (setState runs after the await, not synchronously).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getProducts();
        if (active) {
          setProducts(data);
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
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [products, search]);

  // ---- cart / checkout ----
  const handleAdd = (product) => {
    add(product);
    notify(`${product.name} added to cart`, 'success');
  };

  const handleCheckout = async () => {
    if (!selectedSlot) {
      notify('Please choose a delivery slot first.', 'error');
      setCartOpen(false);
      return;
    }
    setSubmitting(true);
    try {
      const order = await checkout(
        items.map((i) => ({ productId: i.id, qty: i.qty })),
        { date: selectedSlot.date, window: selectedSlot.window }
      );
      clear();
      setCartOpen(false);
      notify(
        `Order placed! $${Number(order.total).toFixed(2)} · delivery ${selectedSlot.dateLabel}, ${selectedSlot.label} 🎉`,
        'success'
      );
      setSelectedSlot(null);
      await load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- admin actions (panel only rendered when isAdmin) ----
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
    <main className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* SEARCH + ACTIONS */}
      <section className="mx-auto mb-8 max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* search */}
          <div className="relative w-full sm:max-w-md">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {/* actions */}
          <div className="flex items-center gap-3">
            <DeliverySlotMenu
              isAdmin={isAdmin}
              selected={selectedSlot}
              onSelect={setSelectedSlot}
              notify={notify}
            />
            {!isAdmin && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-fuchsia-500/25 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                <span className="text-lg">🛒</span> Cart
                {count > 0 && (
                  <span className="bc-pop absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs font-bold text-white ring-2 ring-white">
                    {count}
                  </span>
                )}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setAdminPanelOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95"
              >
                <span className="text-lg">🛠️</span> Admin
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-7xl">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {error}
            <button onClick={load} className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md">
                <div className="bc-skeleton h-36" />
                <div className="space-y-3 p-5">
                  <div className="bc-skeleton h-4 w-3/4 rounded" />
                  <div className="bc-skeleton h-3 w-full rounded" />
                  <div className="bc-skeleton h-8 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
            <span className="text-6xl">🔎</span>
            <p className="mt-4 text-lg font-semibold text-gray-500">No products found</p>
            <p className="text-sm">Try a different search.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'product' : 'products'}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  index={i}
                  mounted={mounted}
                  onAdd={handleAdd}
                  canBuy={!isAdmin}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* OVERLAYS */}
      {!isAdmin && (
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onCheckout={handleCheckout}
          submitting={submitting}
          slot={selectedSlot}
          onChooseSlot={() => setCartOpen(false)}
        />
      )}
      {isAdmin && (
        <AdminPanel
          open={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          products={products}
          onSave={handleSave}
          onDelete={handleDelete}
          onCreate={handleCreate}
          savingId={savingId}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
