import { useState } from 'react';
import DeliveryFeeControl from './DeliveryFeeControl.jsx';
import CatalogueRow, { RowField, rowInput, rowInputBare, LiveToggle }
  from '../admin/catalogue/CatalogueRow.jsx';
import AddCatalogueItem, { addInput } from '../admin/catalogue/AddCatalogueItem.jsx';

const BLANK = { name: '', description: '', price: '', unit: 'per load', turnaround: '48h', image: '' };

/**
 * Laundry service manager, rendered inline on /admin/services.
 *
 * Phase 8 restyle. Two things changed beyond the palette:
 *
 * 1. The unused slide-over drawer branch is gone. Nothing has rendered
 *    this without `inline` since the /admin area was created in Phase 0,
 *    so it was ~50 lines of dead UI on a third palette (sky/emerald)
 *    that would otherwise have had to be restyled too.
 * 2. The row frame, thumbnail and add-form now come from
 *    components/admin/catalogue/, shared with the cleaning and shop
 *    managers, which is what stops the three from drifting again.
 *
 * The draft/dirty/save logic and the payload sent to onSave are unchanged.
 */
export default function LaundryAdminPanel({ services, onSave, onDelete, onCreate, savingId, notify }) {
  const [draft, setDraft] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newS, setNewS] = useState(BLANK);

  const [synced, setSynced] = useState(null);
  if (synced !== services) {
    const d = {};
    for (const s of services)
      d[s._id] = {
        price: s.price,
        unit: s.unit || '',
        turnaround: s.turnaround || '',
        available: s.available,
        image: s.image || '',
      };
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
    } catch {
      /* parent toasts */
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      <DeliveryFeeControl notify={notify} />

      <AddCatalogueItem
        label="Add a laundry service"
        open={showAdd}
        onToggle={() => setShowAdd((v) => !v)}
        onSubmit={submitNew}
        creating={creating}
        image={newS.image}
        onPickImage={(url) => setNewS((s) => ({ ...s, image: url }))}
        onImageUrl={(v) => setNewS((s) => ({ ...s, image: v }))}
      >
        <input
          required
          placeholder="Service name (e.g. Wash & Fold)"
          value={newS.name}
          onChange={(e) => setNewS({ ...newS, name: e.target.value })}
          className={`col-span-2 ${addInput}`}
        />
        <textarea
          rows={2}
          placeholder="Short description"
          value={newS.description}
          onChange={(e) => setNewS({ ...newS, description: e.target.value })}
          className="col-span-2 min-h-[76px] resize-none rounded-btn border border-line bg-white px-3.5 py-3 text-[15px] text-ink placeholder:text-muted"
        />
        <input
          type="number" step="0.01" min="0" required
          placeholder="Charge ($)"
          value={newS.price}
          onChange={(e) => setNewS({ ...newS, price: e.target.value })}
          className={addInput}
        />
        <input
          placeholder="Unit (per load / per item)"
          value={newS.unit}
          onChange={(e) => setNewS({ ...newS, unit: e.target.value })}
          className={addInput}
        />
        <input
          placeholder="Turnaround (e.g. 48h)"
          value={newS.turnaround}
          onChange={(e) => setNewS({ ...newS, turnaround: e.target.value })}
          className={`col-span-2 ${addInput}`}
        />
      </AddCatalogueItem>

      <ul className="space-y-3">
        {services.map((s) => {
          const d = draft[s._id] || {
            price: s.price,
            unit: s.unit || '',
            turnaround: s.turnaround || '',
            available: s.available,
            image: s.image || '',
          };

          return (
            <CatalogueRow
              key={s._id}
              title={s.name}
              subtitle={s.description}
              image={d.image}
              fallback="🧺"
              onPickImage={(url) => edit(s._id, 'image', url)}
              onDelete={() => onDelete(s._id)}
              onSave={() => save(s)}
              dirty={isDirty(s)}
              saving={savingId === s._id}
            >
              <RowField label="Charge" prefix="$" width="w-28">
                <input
                  type="number" step="0.01" min="0"
                  value={d.price}
                  onChange={(e) => edit(s._id, 'price', e.target.value)}
                  aria-label={`Charge for ${s.name}`}
                  className={rowInputBare}
                />
              </RowField>

              <RowField label="Unit">
                <input
                  value={d.unit}
                  onChange={(e) => edit(s._id, 'unit', e.target.value)}
                  aria-label={`Unit for ${s.name}`}
                  className={`w-28 ${rowInput}`}
                />
              </RowField>

              <RowField label="Turnaround">
                <input
                  value={d.turnaround}
                  onChange={(e) => edit(s._id, 'turnaround', e.target.value)}
                  aria-label={`Turnaround for ${s.name}`}
                  className={`w-24 ${rowInput}`}
                />
              </RowField>

              <LiveToggle
                on={d.available}
                onToggle={() => edit(s._id, 'available', !d.available)}
                label={`Toggle availability for ${s.name}`}
              />
            </CatalogueRow>
          );
        })}

        {services.length === 0 && (
          <li className="rounded-card border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="bc-h4">No laundry services yet</p>
            <p className="mt-2 bc-meta text-muted">Add your first one above.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
