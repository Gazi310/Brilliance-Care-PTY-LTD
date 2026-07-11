import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { getProduct } from '../services/productService.js';
import ToastStack from '../components/products/ToastStack.jsx';

// Per-category colour theming (mirrors ProductCard).
const CATEGORY_STYLES = {
  Laundry: { gradient: 'from-sky-500 to-blue-600', soft: 'from-sky-50 to-blue-50', chip: 'bg-blue-100 text-blue-700' },
  Cleaning: { gradient: 'from-emerald-500 to-teal-600', soft: 'from-emerald-50 to-teal-50', chip: 'bg-emerald-100 text-emerald-700' },
  'Eco-Friendly': { gradient: 'from-lime-500 to-green-600', soft: 'from-lime-50 to-green-50', chip: 'bg-lime-100 text-lime-700' },
  Accessories: { gradient: 'from-violet-500 to-fuchsia-600', soft: 'from-violet-50 to-fuchsia-50', chip: 'bg-violet-100 text-violet-700' },
  default: { gradient: 'from-slate-500 to-slate-700', soft: 'from-slate-50 to-slate-100', chip: 'bg-slate-100 text-slate-700' },
};

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

function Stars({ rating = 0 }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={17} height={17} fill={i < full ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.5l6-.8L12 3.2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-500">{Number(rating || 0).toFixed(1)}</span>
    </span>
  );
}

/** Back link + a cart button that links to the full cart page. */
function TopBar({ count }) {
  return (
    <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-gray-900"
      >
        <span className="text-base">←</span> Back to shop
      </Link>
      <Link
        to="/cart"
        className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-fuchsia-500/25 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
      >
        <span className="text-base">🛒</span> Cart
        {count > 0 && (
          <span className="bc-pop absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-pink-500 px-1.5 text-xs font-bold text-white ring-2 ring-white">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { add, count } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = 'success') => {
    const tid = Date.now() + Math.random();
    setToasts((t) => [...t, { id: tid, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== tid)), 3400);
  };
  const dismiss = (tid) => setToasts((t) => t.filter((x) => x.id !== tid));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setQty(1);
    (async () => {
      try {
        const data = await getProduct(id);
        if (active) setProduct(data);
      } catch (err) {
        if (active) setError(err.message || 'Could not load this product.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const s = CATEGORY_STYLES[product?.category] || CATEGORY_STYLES.default;
  const stock = product?.stock ?? 0;
  const outOfStock = product ? !product.available || stock <= 0 : true;
  const low = !outOfStock && stock <= 5;
  const photo = isPhoto(product?.image);
  const maxQty = Math.max(1, stock || 1);

  const handleAdd = () => {
    if (!product || outOfStock) return;
    add(product, qty);
    notify(`${product.name} ×${qty} added to cart`, 'success');
  };

  return (
    <main className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:pb-10">
      <TopBar count={count} />

      {/* Loading */}
      {loading ? (
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          <div className="bc-skeleton h-80 rounded-3xl" />
          <div className="space-y-4">
            <div className="bc-skeleton h-6 w-1/3 rounded" />
            <div className="bc-skeleton h-9 w-3/4 rounded" />
            <div className="bc-skeleton h-4 w-full rounded" />
            <div className="bc-skeleton h-4 w-5/6 rounded" />
            <div className="bc-skeleton h-12 w-1/2 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-lg font-bold text-red-700">⚠️ {error}</p>
          <Link to="/products" className="mt-4 inline-block rounded-xl bg-red-100 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-200">
            Return to shop
          </Link>
        </div>
      ) : product ? (
        <article className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-2">
          {/* Image / emoji panel */}
          <div className={`relative flex h-72 items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br ${s.soft} shadow-md sm:h-96`}>
            {photo ? (
              <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="text-[7rem] drop-shadow-sm sm:text-[9rem]">{product.image || '🧴'}</span>
            )}
            <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${s.chip}`}>
              {product.category}
            </span>
            <span
              className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
                outOfStock ? 'bg-red-100 text-red-700' : low ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {outOfStock ? 'Out of stock' : low ? `Only ${stock} left` : 'In stock'}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">{product.name}</h1>

            <div className="mt-2 flex items-center gap-3">
              <Stars rating={product.rating} />
            </div>

            <p className="mt-4 text-3xl font-extrabold text-gray-900">${Number(product.price || 0).toFixed(2)}</p>

            <div className="mt-5">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Description</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {product.description?.trim() || 'No description provided for this product yet.'}
              </p>
            </div>

            {/* Quantity + add */}
            {!outOfStock && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-gray-500 transition hover:text-gray-900"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-bold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="px-3.5 py-2.5 text-gray-500 transition hover:text-gray-900 disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${s.gradient} px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95`}
                >
                  Add to cart <span className="text-base leading-none">＋</span>
                </button>
              </div>
            )}

            {outOfStock && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500">
                This product is currently sold out. Please check back soon.
              </div>
            )}

            {/* Delivery note — seller schedules the drop-off */}
            <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
              <span className="text-base">🚚</span>
              <p className="text-[12px] leading-relaxed text-emerald-700/90">
                Delivered at the earliest suitable time — no slot to pick. A flat delivery fee is added
                at checkout and we'll keep you posted on the way.
              </p>
            </div>
          </div>
        </article>
      ) : null}

      {/* Toasts */}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
