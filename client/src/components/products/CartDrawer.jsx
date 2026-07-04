import { useState } from 'react';
import { useCart } from '../../context/CartContext.jsx';
import { checkout } from '../../services/orderService.js';
import SlotCalendar from './SlotCalendar.jsx';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

// One collapsible slot field with an inline mini-calendar.
function SlotField({ icon, title, hint, accent, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-gray-50"
      >
        <span className="text-lg">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-800">{title}</p>
          {value ? (
            <p className="truncate text-[11px] font-semibold text-emerald-600">
              {value.dateLabel} · {value.label} ({value.time})
            </p>
          ) : (
            <p className="truncate text-[11px] text-gray-400">{hint}</p>
          )}
        </div>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="rounded-full px-1.5 text-gray-300 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Clear"
          >
            ✕
          </span>
        )}
        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-gray-100 p-3">
          <SlotCalendar
            value={value}
            accent={accent}
            onChange={(s) => {
              onChange(s);
              if (s) setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function Line({ item, setQty, remove }) {
  return (
    <li className="bc-fade-up flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50 text-3xl">
        {isPhoto(item.image) ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : item.image}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight text-gray-800">{item.name}</p>
          <button onClick={() => remove(item.id)} className="text-gray-300 transition hover:text-red-500" aria-label="Remove">✕</button>
        </div>
        <p className="text-xs text-gray-400">${item.price.toFixed(2)} each</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="inline-flex items-center rounded-lg border border-gray-200">
            <button onClick={() => setQty(item.id, item.qty - 1)} className="px-2.5 py-1 text-gray-500 transition hover:text-gray-900">−</button>
            <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
            <button
              onClick={() => setQty(item.id, item.qty + 1)}
              disabled={item.qty >= (item.stock ?? 99)}
              className="px-2.5 py-1 text-gray-500 transition hover:text-gray-900 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <span className="text-sm font-bold text-gray-900">${(item.price * item.qty).toFixed(2)}</span>
        </div>
      </div>
    </li>
  );
}

/**
 * The SHOP cart drawer — products only, paid in full (blueprint §4.6:
 * the service estimate lives in the /book flow instead).
 */
export default function CartDrawer({ open, onClose, notify, onDone }) {
  const {
    items, setQty, remove, clear, count,
    subtotal, deliveryFee, deliveryTotal, grandTotal, slotsReady,
    deliverySlot, setDeliverySlot,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const empty = count === 0;

  const placeOrder = async () => {
    if (!slotsReady) {
      notify?.('Please choose your delivery slot first.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const order = await checkout({ products: items, deliverySlot });
      clear();
      notify?.(`Order placed! $${Number(order.total).toFixed(2)} 🎉`, 'success');
      onDone?.();
      onClose?.();
    } catch (err) {
      notify?.(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-gray-50 shadow-2xl transition-transform duration-500 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <span className="text-xl">🛒</span> Your Cart
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{count}</span>
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close cart">✕</button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {empty ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <span className="bc-float text-6xl">🛒</span>
              <p className="mt-4 font-medium text-gray-500">Your cart is empty</p>
              <p className="text-sm">Add products from the shop to get started.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <section>
                <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-gray-400">🛍️ Products</p>
                <ul className="space-y-3">
                  {items.map((i) => <Line key={i.id} item={i} setQty={setQty} remove={remove} />)}
                </ul>
              </section>

              {/* Delivery slot */}
              <section className="space-y-2">
                <p className="px-1 text-xs font-bold uppercase tracking-wide text-gray-400">📅 Choose your delivery slot</p>
                <SlotField icon="🚚" title="Product delivery" hint="Required — pick a day & time" accent="emerald" value={deliverySlot} onChange={setDeliverySlot} />
                <p className="px-1 text-[11px] leading-relaxed text-gray-400">
                  Booking laundry or cleaning too? Those are booked (with a small deposit) via{' '}
                  <span className="font-semibold text-gray-500">Book a service</span> — this cart is just for
                  shop products, paid in full.
                </p>
              </section>
            </div>
          )}
        </div>

        {!empty && (
          <footer className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-700">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Delivery</span>
                <span className="font-semibold text-gray-700">
                  {slotsReady ? `$${deliveryTotal.toFixed(2)}` : `$${deliveryFee.toFixed(2)} — pick a slot`}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-2">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-2xl font-extrabold text-gray-900">${(slotsReady ? grandTotal : subtotal).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={submitting || !slotsReady}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Processing…' : slotsReady ? `Checkout · $${grandTotal.toFixed(2)}` : 'Pick your delivery slot to continue'}
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
