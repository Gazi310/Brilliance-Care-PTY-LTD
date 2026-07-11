import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { checkout } from '../services/orderService.js';
import ToastStack from '../components/products/ToastStack.jsx';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

function Line({ item, setQty, remove }) {
  return (
    <li className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 text-4xl">
        {isPhoto(item.image) ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : item.image}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold leading-tight text-gray-800">{item.name}</p>
          <button onClick={() => remove(item.id)} className="text-gray-300 transition hover:text-red-500" aria-label="Remove">✕</button>
        </div>
        <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="inline-flex items-center rounded-lg border border-gray-200">
            <button onClick={() => setQty(item.id, item.qty - 1)} className="px-3 py-1.5 text-gray-500 transition hover:text-gray-900">−</button>
            <span className="w-9 text-center text-sm font-semibold">{item.qty}</span>
            <button
              onClick={() => setQty(item.id, item.qty + 1)}
              disabled={item.qty >= (item.stock ?? 99)}
              className="px-3 py-1.5 text-gray-500 transition hover:text-gray-900 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <span className="font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
        </div>
      </div>
    </li>
  );
}

/**
 * The SHOP cart as a full page (route: /cart) — products only, paid in full.
 * Delivery is handled on the seller's schedule (no slot to pick); a flat
 * delivery fee is added automatically. Laundry & cleaning are booked via /book.
 */
export default function Cart() {
  const { items, setQty, remove, clear, count, subtotal, deliveryTotal, grandTotal } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const empty = count === 0;

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const order = await checkout({ products: items });
      clear();
      setPlaced(order);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Success state ----
  if (placed) {
    return (
      <main className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:pb-10">
        <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Order placed!</h1>
          <p className="mt-1 text-gray-500">
            Thanks — we've got your order and will deliver it at the earliest suitable time.
          </p>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">${Number(placed.total).toFixed(2)}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Continue shopping
            </Link>
            <Link
              to="/account/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              View my orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:pb-10">
      {/* Top bar */}
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-gray-900"
        >
          <span className="text-base">←</span> Continue shopping
        </Link>
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-gray-900">
          <span className="text-xl">🛒</span> Your Cart
          {count > 0 && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{count}</span>
          )}
        </h1>
      </div>

      {empty ? (
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-20 text-center shadow-sm">
          <span className="bc-float text-6xl">🛒</span>
          <p className="mt-4 text-lg font-semibold text-gray-600">Your cart is empty</p>
          <p className="text-sm text-gray-400">Add products from the shop to get started.</p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-3">
          {/* Items */}
          <section className="lg:col-span-2">
            <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-gray-400">🛍️ Products</p>
            <ul className="space-y-3">
              {items.map((i) => (
                <Line key={i.id} item={i} setQty={setQty} remove={remove} />
              ))}
            </ul>
          </section>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-400">Order summary</h2>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-700">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="font-semibold text-gray-700">${deliveryTotal.toFixed(2)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-2">
                  <span className="text-gray-500">Total</span>
                  <span className="text-2xl font-extrabold text-gray-900">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Processing…' : `Checkout · $${grandTotal.toFixed(2)}`}
              </button>

              <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
                <span className="text-base">🚚</span>
                <p className="text-[12px] leading-relaxed text-emerald-700/90">
                  No slot to pick — we'll deliver at the earliest suitable time. A flat delivery fee is
                  included above.
                </p>
              </div>
            </div>
          </aside>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
