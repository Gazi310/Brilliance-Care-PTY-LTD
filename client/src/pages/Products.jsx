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
import AdminLoginModal from '../components/products/AdminLoginModal.jsx';
import AdminPanel from '../components/products/AdminPanel.jsx';
import ToastStack from '../components/products/ToastStack.jsx';

export default function Products() {
  const { isAdmin, login, logout } = useAuth();
  const { items, add, clear, count } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [cartOpen, setCartOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

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
      setError('');
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setMounted(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (q === '' || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  }, [products, search, category]);

  // ---- cart / checkout ----
  const handleAdd = (product) => {
    add(product);
    notify(`${product.name} added to cart`, 'success');
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    try {
      const order = await checkout(items.map((i) => ({ productId: i.id, qty: i.qty })));
      clear();
      setCartOpen(false);
      notify(`Order placed! Total $${Number(order.total).toFixed(2)} 🎉`, 'success');
      await load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- admin ----
  const openAdmin = () => (isAdmin ? setAdminPanelOpen(true) : setAdminLoginOpen(true));

  const handleAdminLogin = async (email, password) => {
    const user = await login(email, password); // throws on bad credentials
    if (!user.isAdmin) {
      logout();
      throw new Error('This account does not have admin access.');
    }
    setAdminLoginOpen(false);
    setAdminPanelOpen(true);
    notify('Welcome back, admin 👋', 'info');
  };

  const handleAdminLogout = () => {
    logout();
    setAdminPanelOpen(false);
    notify('Logged out of admin.', 'info');
  };

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
      {/* HERO / TOOLBAR */}
      <section className="relative mx-auto mb-8 max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 px-6 py-10 shadow-xl sm:px-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <span className="bc-float">🧴</span> Brilliance Care Shop
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Premium Care Products</h1>
            <p className="mt-2 max-w-md text-sm text-white/80">
              Eco-friendly detergents, cleaners and accessories — delivered fresh to your door.
            </p>
          </div>

          {/* actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
            >
              <span className="text-lg">🛒</span> Cart
              {count > 0 && (
                <span className="bc-pop absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs font-bold text-white ring-2 ring-white">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={openAdmin}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900/40 px-4 py-3 text-sm font-bold text-white shadow-lg ring-1 ring-white/30 backdrop-blur transition hover:-translate-y-0.5 hover:bg-slate-900/60 active:scale-95"
            >
              <span className="text-lg">{isAdmin ? '🛠️' : '🔐'}</span>
              {isAdmin ? 'Admin' : 'Admin Login'}
              {isAdmin && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
            </button>
          </div>
        </div>

        {/* search + filters */}
        <div className="relative mt-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-white/20 bg-white/95 py-3 pl-11 pr-4 text-sm text-gray-800 shadow-sm outline-none transition focus:ring-2 focus:ring-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  category === c ? 'bg-white text-violet-700 shadow' : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {c}
              </button>
            ))}
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
            <p className="text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'product' : 'products'}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} mounted={mounted} onAdd={handleAdd} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* OVERLAYS */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} submitting={submitting} />
      <AdminLoginModal open={adminLoginOpen} onClose={() => setAdminLoginOpen(false)} onLogin={handleAdminLogin} />
      <AdminPanel
        open={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        products={products}
        onSave={handleSave}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onLogout={handleAdminLogout}
        savingId={savingId}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
