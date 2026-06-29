import { useState } from 'react';

const CATEGORIES = ['Laundry', 'Cleaning', 'Eco-Friendly', 'Accessories', 'General'];

// Is this product "image" an uploaded photo / URL (vs a plain emoji)?
const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) ||
    img.startsWith('data:') ||
    img.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

// Read an image file, downscale it and return a compact JPEG data URL.
function readImageFile(file, max = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const BLANK = { name: '', category: 'Laundry', price: '', stock: '', image: '' };

export default function AdminPanel({ open, onClose, products, onSave, onDelete, onCreate, savingId }) {
  const [draft, setDraft] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newP, setNewP] = useState(BLANK);

  // Keep a local editable copy of each product in sync with the latest data
  // (synced during render, not in an effect, to avoid cascading renders).
  const [syncedProducts, setSyncedProducts] = useState(null);
  if (syncedProducts !== products) {
    const d = {};
    for (const p of products) d[p._id] = { price: p.price, stock: p.stock, available: p.available, image: p.image || '' };
    setDraft(d);
    setSyncedProducts(products);
  }

  const edit = (id, field, value) => setDraft((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));

  const isDirty = (p) => {
    const d = draft[p._id];
    if (!d) return false;
    return (
      Number(d.price) !== p.price ||
      Number(d.stock) !== p.stock ||
      d.available !== p.available ||
      (d.image || '') !== (p.image || '')
    );
  };

  const save = (p) => {
    const d = draft[p._id];
    onSave(p._id, {
      price: Number(d.price) || 0,
      stock: Math.max(0, Number(d.stock) || 0),
      available: d.available,
      image: d.image || '',
    });
  };

  const pickNewImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await readImageFile(file);
      setNewP((p) => ({ ...p, image: url }));
    } catch {
      /* ignore unreadable file */
    }
  };

  const pickRowImage = async (id, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await readImageFile(file);
      edit(id, 'image', url);
    } catch {
      /* ignore */
    }
  };

  const submitNew = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreate({
        name: newP.name.trim(),
        category: newP.category,
        price: Number(newP.price) || 0,
        stock: Math.max(0, Number(newP.stock) || 0),
        image: newP.image || '',
      });
      setNewP(BLANK);
      setShowAdd(false);
    } catch {
      /* error toast handled by parent */
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-gray-50 shadow-2xl transition-transform duration-500 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span>🛠️</span> Inventory Control
            </h2>
            <p className="text-xs text-slate-300">Manage photos, stock, price and availability.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Close">
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Add-product */}
          <div className="mb-4">
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-violet-300 hover:text-violet-600"
            >
              {showAdd ? '− Close' : '＋ Add new product'}
            </button>
            {showAdd && (
              <form onSubmit={submitNew} className="bc-fade-up mt-3 grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <input
                  required
                  placeholder="Product name"
                  value={newP.name}
                  onChange={(e) => setNewP({ ...newP, name: e.target.value })}
                  className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                />

                {/* Product photo */}
                <div className="col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Product photo</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-2xl">
                      {newP.image ? (
                        isPhoto(newP.image) ? (
                          <img src={newP.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{newP.image}</span>
                        )
                      ) : (
                        <span className="text-gray-300">🖼️</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100">
                        ⬆ Upload photo
                        <input type="file" accept="image/*" className="hidden" onChange={pickNewImage} />
                      </label>
                      <input
                        placeholder="or paste image URL"
                        value={newP.image.startsWith('data:') ? '' : newP.image}
                        onChange={(e) => setNewP({ ...newP, image: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                      />
                    </div>
                  </div>
                </div>

                <select
                  value={newP.category}
                  onChange={(e) => setNewP({ ...newP, category: e.target.value })}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Price"
                  value={newP.price}
                  onChange={(e) => setNewP({ ...newP, price: e.target.value })}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Stock qty"
                  value={newP.stock}
                  onChange={(e) => setNewP({ ...newP, stock: e.target.value })}
                  className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
                />
                <button
                  type="submit"
                  disabled={creating}
                  className="col-span-2 rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                >
                  {creating ? 'Adding…' : 'Add product'}
                </button>
              </form>
            )}
          </div>

          {/* Product rows */}
          <ul className="space-y-3">
            {products.map((p) => {
              const d = draft[p._id] || { price: p.price, stock: p.stock, available: p.available, image: p.image || '' };
              return (
                <li key={p._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <label
                      className="group/img relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gray-50 text-2xl"
                      title="Change photo"
                    >
                      {isPhoto(d.image) ? (
                        <img src={d.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{d.image || '🧴'}</span>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white opacity-0 transition group-hover/img:opacity-100">
                        ✎
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => pickRowImage(p._id, e)} />
                    </label>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                    </div>
                    <button onClick={() => onDelete(p._id)} title="Delete product" className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500">
                      🗑️
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    {/* Stock stepper */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Stock qty</label>
                      <div className="inline-flex items-center rounded-lg border border-gray-200">
                        <button type="button" onClick={() => edit(p._id, 'stock', Math.max(0, Number(d.stock) - 1))} className="px-2.5 py-1.5 text-gray-500 transition hover:text-gray-900">−</button>
                        <input
                          type="number"
                          min="0"
                          value={d.stock}
                          onChange={(e) => edit(p._id, 'stock', e.target.value)}
                          className="w-16 border-x border-gray-200 py-1.5 text-center text-sm outline-none"
                        />
                        <button type="button" onClick={() => edit(p._id, 'stock', Number(d.stock) + 1)} className="px-2.5 py-1.5 text-gray-500 transition hover:text-gray-900">+</button>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Price</label>
                      <div className="inline-flex items-center rounded-lg border border-gray-200 px-2">
                        <span className="text-sm text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={d.price}
                          onChange={(e) => edit(p._id, 'price', e.target.value)}
                          className="w-20 py-1.5 text-sm outline-none"
                        />
                      </div>
                    </div>

                    {/* Availability toggle */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Live</label>
                      <button
                        type="button"
                        onClick={() => edit(p._id, 'available', !d.available)}
                        className={`relative h-7 w-12 rounded-full transition ${d.available ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        aria-label="Toggle availability"
                      >
                        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${d.available ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>

                    {/* Save */}
                    <button
                      onClick={() => save(p)}
                      disabled={!isDirty(p) || savingId === p._id}
                      className={`ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                        isDirty(p) ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-md active:scale-95' : 'cursor-not-allowed bg-gray-200 text-gray-400'
                      }`}
                    >
                      {savingId === p._id ? 'Saving…' : isDirty(p) ? 'Save' : 'Saved'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
