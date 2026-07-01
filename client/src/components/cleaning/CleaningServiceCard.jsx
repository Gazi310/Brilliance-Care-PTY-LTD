import { useState } from 'react';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

export default function CleaningServiceCard({ service, index = 0, mounted = true, onAdd, canBook = true }) {
  const [added, setAdded] = useState(false);
  const photo = isPhoto(service.image);

  const handleAdd = () => {
    onAdd?.(service);
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
      <div className="pointer-events-none absolute -inset-1 rounded-[26px] bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-40" />

      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-md transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-2xl">
        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
          {photo ? (
            <img src={service.image} alt={service.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
          ) : (
            <span className="text-6xl drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6">{service.image || '🫧'}</span>
          )}
          <span className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          {service.duration && (
            <span className="absolute right-3 top-3 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-sm">
              ⏱ {service.duration}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-base font-bold leading-snug text-gray-800">{service.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">{service.description}</p>

          <div className="mt-4 flex items-center justify-between">
            <span className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-gray-900">${Number(service.price || 0).toFixed(2)}</span>
              {service.unit && <span className="text-xs font-medium text-gray-400">{service.unit}</span>}
            </span>
            {canBook && (
              <button
                onClick={handleAdd}
                className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
              >
                {added ? '✓ Added' : (<><span>Book</span><span className="text-base leading-none">＋</span></>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
