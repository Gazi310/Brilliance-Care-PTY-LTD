import { useState } from 'react';

// Per-category colour theming.
const CATEGORY_STYLES = {
  Laundry: { gradient: 'from-sky-500 to-blue-600', soft: 'from-sky-50 to-blue-50', chip: 'bg-blue-100 text-blue-700' },
  Cleaning: { gradient: 'from-emerald-500 to-teal-600', soft: 'from-emerald-50 to-teal-50', chip: 'bg-emerald-100 text-emerald-700' },
  'Eco-Friendly': { gradient: 'from-lime-500 to-green-600', soft: 'from-lime-50 to-green-50', chip: 'bg-lime-100 text-lime-700' },
  Accessories: { gradient: 'from-violet-500 to-fuchsia-600', soft: 'from-violet-50 to-fuchsia-50', chip: 'bg-violet-100 text-violet-700' },
  default: { gradient: 'from-slate-500 to-slate-700', soft: 'from-slate-50 to-slate-100', chip: 'bg-slate-100 text-slate-700' },
};

function Stars({ rating = 0 }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? 'fill-current' : 'fill-gray-200'}`}>
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductCard({ product, index = 0, mounted = true, onAdd }) {
  const s = CATEGORY_STYLES[product.category] || CATEGORY_STYLES.default;
  const stock = product.stock ?? 0;
  const outOfStock = !product.available || stock <= 0;
  const low = !outOfStock && stock <= 5;
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (outOfStock) return;
    onAdd?.(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div
      style={{ transitionDelay: `${index * 70}ms` }}
      className={`group relative transition-all duration-500 ease-out will-change-transform ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      {/* glow halo on hover */}
      <div className={`pointer-events-none absolute -inset-1 rounded-[26px] bg-gradient-to-br ${s.gradient} opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-40`} />

      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-md transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-2xl">
        {/* image / icon area */}
        <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${s.soft}`}>
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          <span className="text-6xl drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6">
            {product.image}
          </span>
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.chip}`}>
            {product.category}
          </span>
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              outOfStock ? 'bg-red-100 text-red-700' : low ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {outOfStock ? 'Out of stock' : low ? `Only ${stock} left` : 'In stock'}
          </span>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <Stars rating={product.rating} />
            <span className="text-xs text-gray-400">{Number(product.rating || 0).toFixed(1)}</span>
          </div>
          <h3 className="text-base font-bold leading-snug text-gray-800">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">{product.description}</p>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-extrabold text-gray-900">${Number(product.price || 0).toFixed(2)}</span>
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                outOfStock
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : `bg-gradient-to-r ${s.gradient} text-white shadow-md hover:shadow-lg active:scale-95`
              }`}
            >
              {added ? '✓ Added' : outOfStock ? 'Sold out' : (
                <>
                  <span>Add</span>
                  <span className="text-base leading-none">＋</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
