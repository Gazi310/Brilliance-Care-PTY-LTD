import { useCart } from '../../context/CartContext.jsx';

export default function CartDrawer({ open, onClose, onCheckout, submitting }) {
  const { items, setQty, remove, total, count } = useCart();

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-gray-50 shadow-2xl transition-transform duration-500 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <span className="text-xl">🛒</span> Your Cart
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">{count}</span>
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700" aria-label="Close cart">
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <span className="bc-float text-6xl">🛒</span>
              <p className="mt-4 font-medium text-gray-500">Your cart is empty</p>
              <p className="text-sm">Add some products to get started.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="bc-fade-up flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-3xl">{i.image}</div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-tight text-gray-800">{i.name}</p>
                      <button onClick={() => remove(i.id)} className="text-gray-300 transition hover:text-red-500" aria-label="Remove">✕</button>
                    </div>
                    <p className="text-xs text-gray-400">${i.price.toFixed(2)} each</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-lg border border-gray-200">
                        <button onClick={() => setQty(i.id, i.qty - 1)} className="px-2.5 py-1 text-gray-500 transition hover:text-gray-900">−</button>
                        <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                        <button
                          onClick={() => setQty(i.id, i.qty + 1)}
                          disabled={i.qty >= (i.stock ?? 99)}
                          className="px-2.5 py-1 text-gray-500 transition hover:text-gray-900 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gray-900">${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-gray-200 bg-white px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-2xl font-extrabold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl active:scale-[.98] disabled:opacity-60"
            >
              {submitting ? 'Processing…' : 'Checkout'}
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
