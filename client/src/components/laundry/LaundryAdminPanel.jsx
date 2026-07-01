import { useState } from 'react';
import DeliveryFeeControl from './DeliveryFeeControl.jsx';

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/') || /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

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

const BLANK = { name: '', description: '', price: '', unit: 'per load', turnaround: '48h', image: '' };

export default function LaundryAdminPanel({ open, onClose, services, onSave, onDelete, onCreate, savingId, notify }) {
  const [draft, setDraft] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newS, setNewS] = useState(BLANK);

  const [synced, setSynced] = useState(null);
  if (synced !== services) {
    const d = {};
    for (const s of services) d[s._id] = { price: s.price, unit: s.unit || '', turnaround: s.turnaround || '', available: s.available, image: s.image || '' };
    setDraft(d);
    setSynced(services);
  }

  const edit = (id, field, value) => setDraft((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));

  const isDirty = (s) => {
    const d = draft[s._id];
    if (!d) return false;
    return (
      Number(d.price) !== s.price ||
      (d.unit || '') !== (s.unit || '') ||
      (d.turnaround || '') !== (s.turnaround || '') ||
      d.available !== s.available ||
      (d.image || '') !== (s.image || '')
    );
  };

  const save = (s) => {
    const d = draft[s._id];
    onSave(s._id, {
      price: Number(d.price) || 0,
      unit: d.unit || '',
      turnaround: d.turnaround || '',
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
      setNewS((s) => ({ ...s, image: url }));
    } catch { /* ignore */ }
  };
  const pickRowImage = async (id, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      edit(id, 'image', await readImageFile(file));
    } catch { /* ignore */ }
  };

  const submitNew = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await onCreate({
        name: newS.name.trim(),
        description: newS.description.trim(),
        price: Number(newS.price) || 0,
        unit: newS.unit || 'per load',
        turnaround: newS.turnaround || '',
        image: newS.image || '',
      });
      setNewS(BLANK);
      setShowAdd(false);
    } catch { /* parent toasts */ } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-gray-50 shadow-2xl transition-transform duration-500 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between bg-gradient-to-r from-sky-700 to-blue-800 px-6 py-5 text-white">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold"><span>🧺</span> Laundry Services</h2>
            <p className="text-xs text-sky-100">Add services, upload photos and set the charge.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="Close">✕</button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Delivery fee */}
          <div className="mb-4">
            <DeliveryFeeControl notify={notify} />
          </div>

          {/* Add service */}
          <div className="mb-4">
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-semibold text-gray-500 transition hover:border-sky-300 hover:text-sky-600"
            >
              {showAdd ? '− Close' : '＋ Add laundry service'}
            </button>
            {showAdd && (
              <form onSubmit={submitNew} className="bc-fade-up mt-3 grid grid-cols-2 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <input required placeholder="Service name (e.g. Wash & Fold)" value={newS.name} onChange={(e) => setNewS({ ...newS, name: e.target.value })} className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />
                <textarea placeholder="Short description" value={newS.description} onChange={(e) => setNewS({ ...newS, description: e.target.value })} rows={2} className="col-span-2 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />

                {/* Photo */}
                <div className="col-span-2">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Service photo</label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-2xl">
                      {newS.image ? (isPhoto(newS.image) ? <img src={newS.image} alt="" className="h-full w-full object-cover" /> : <span>{newS.image}</span>) : <span className="text-gray-300">🖼️</span>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100">
                        ⬆ Upload photo
                        <input type="file" accept="image/*" className="hidden" onChange={pickNewImage} />
                      </label>
                      <input placeholder="or paste image URL / emoji" value={newS.image.startsWith('data:') ? '' : newS.image} onChange={(e) => setNewS({ ...newS, image: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />
                    </div>
                  </div>
                </div>

                <input type="number" step="0.01" min="0" required placeholder="Charge ($)" value={newS.price} onChange={(e) => setNewS({ ...newS, price: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />
                <input placeholder="Unit (per load / per item)" value={newS.unit} onChange={(e) => setNewS({ ...newS, unit: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />
                <input placeholder="Turnaround (e.g. 48h)" value={newS.turnaround} onChange={(e) => setNewS({ ...newS, turnaround: e.target.value })} className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-sky-400" />
                <button type="submit" disabled={creating} className="col-span-2 rounded-lg bg-sky-600 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60">
                  {creating ? 'Adding…' : 'Add service'}
                </button>
              </form>
            )}
          </div>

          {/* Service rows */}
          <ul className="space-y-3">
            {services.map((s) => {
              const d = draft[s._id] || { price: s.price, unit: s.unit || '', turnaround: s.turnaround || '', available: s.available, image: s.image || '' };
              return (
                <li key={s._id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <label className="group/img relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gray-50 text-2xl" title="Change photo">
                      {isPhoto(d.image) ? <img src={d.image} alt="" className="h-full w-full object-cover" /> : <span>{d.image || '🧺'}</span>}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white opacity-0 transition group-hover/img:opacity-100">✎</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => pickRowImage(s._id, e)} />
                    </label>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-800">{s.name}</p>
                      <p className="line-clamp-1 text-xs text-gray-400">{s.description || '—'}</p>
                    </div>
                    <button onClick={() => onDelete(s._id)} title="Delete service" className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500">🗑️</button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Charge</label>
                      <div className="inline-flex items-center rounded-lg border border-gray-200 px-2">
                        <span className="text-sm text-gray-400">$</span>
                        <input type="number" step="0.01" min="0" value={d.price} onChange={(e) => edit(s._id, 'price', e.target.value)} className="w-20 py-1.5 text-sm outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Unit</label>
                      <input value={d.unit} onChange={(e) => edit(s._id, 'unit', e.target.value)} className="w-28 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-sky-400" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Turnaround</label>
                      <input value={d.turnaround} onChange={(e) => edit(s._id, 'turnaround', e.target.value)} className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-sky-400" />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">Live</label>
                      <button type="button" onClick={() => edit(s._id, 'available', !d.available)} className={`relative h-7 w-12 rounded-full transition ${d.available ? 'bg-emerald-500' : 'bg-gray-300'}`} aria-label="Toggle availability">
                        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${d.available ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <button
                      onClick={() => save(s)}
                      disabled={!isDirty(s) || savingId === s._id}
                      className={`ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${isDirty(s) ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-md active:scale-95' : 'cursor-not-allowed bg-gray-200 text-gray-400'}`}
                    >
                      {savingId === s._id ? 'Saving…' : isDirty(s) ? 'Save' : 'Saved'}
                    </button>
                  </div>
                </li>
              );
            })}
            {services.length === 0 && (
              <li className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
                No laundry services yet — add your first one above.
              </li>
            )}
          </ul>
        </div>
      </aside>
    </>
  );
}
