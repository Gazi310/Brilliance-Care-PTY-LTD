import { useState } from 'react';
import DeliveryFeeControl from '../laundry/DeliveryFeeControl.jsx';
import CatalogueRow, { RowField, rowInput, rowInputBare, LiveToggle }
  from '../admin/catalogue/CatalogueRow.jsx';
import AddCatalogueItem, { addInput } from '../admin/catalogue/AddCatalogueItem.jsx';

const BLANK = {
  name: '', description: '', price: '', unit: 'per visit', duration: '2h', image: '',
  pricingMode: 'flat', perBedroom: '', perBathroom: '', isAddon: false,
};

/**
 * Cleaning service manager, rendered inline on /admin/cleaning.
 *
 * Phase 8 restyle — same treatment as the laundry manager: shared row
 * shell from components/admin/catalogue/, dead drawer branch removed,
 * emerald/gray palette replaced with navy & gold. The pricing-model
 * block (flat vs home-size, per-bedroom and per-bathroom uplifts) is
 * cleaning-only and stays inline; it feeds BookingContext's estimate
 * engine, so none of its field names or payload shape changed.
 */
export default function CleaningAdminPanel({ services, onSave, onDelete, onCreate, savingId, notify }) {
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
        duration: s.duration || '',
        available: s.available,
        image: s.image || '',
        pricingMode: s.pricingMode || 'flat',
        perBedroom: s.perBedroom ?? 0,
        perBathroom: s.perBathroom ?? 0,
        isAddon: !!s.isAddon,
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
      (d.duration || '') !== (s.duration || '') ||
      d.available !== s.available ||
      (d.image || '') !== (s.image || '') ||
      (d.pricingMode || 'flat') !== (s.pricingMode || 'flat') ||
      Number(d.perBedroom) !== (s.perBedroom ?? 0) ||
      Number(d.perBathroom) !== (s.perBathroom ?? 0) ||
      !!d.isAddon !== !!s.isAddon
    );
  };

  const save = (s) => {
    const d = draft[s._id];
    onSave(s._id, {
      price: Number(d.price) || 0,
      unit: d.unit || '',
      duration: d.duration || '',
      available: d.available,
      image: d.image || '',
      pricingMode: d.pricingMode || 'flat',
      perBedroom: Number(d.perBedroom) || 0,
      perBathroom: Number(d.perBathroom) || 0,
      isAddon: !!d.isAddon,
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
        unit: newS.unit || 'per visit',
        duration: newS.duration || '',
        image: newS.image || '',
        pricingMode: newS.pricingMode || 'flat',
        perBedroom: Number(newS.perBedroom) || 0,
        perBathroom: Number(newS.perBathroom) || 0,
        isAddon: !!newS.isAddon,
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
        label="Add a cleaning service"
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
          placeholder="Service name (e.g. Deep Cleaning)"
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
          placeholder="Unit (per visit / per room)"
          value={newS.unit}
          onChange={(e) => setNewS({ ...newS, unit: e.target.value })}
          className={addInput}
        />
        <input
          placeholder="Duration (e.g. 2h)"
          value={newS.duration}
          onChange={(e) => setNewS({ ...newS, duration: e.target.value })}
          className={`col-span-2 ${addInput}`}
        />

        {/* Pricing model */}
        <div className="col-span-2 grid grid-cols-2 items-end gap-4 rounded-btn bg-sky-50 p-4">
          <div>
            <label
              htmlFor="new-cleaning-pricing"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-muted"
            >
              Pricing
            </label>
            <select
              id="new-cleaning-pricing"
              value={newS.pricingMode}
              onChange={(e) => setNewS({ ...newS, pricingMode: e.target.value })}
              className={addInput}
            >
              <option value="flat">Flat — price × qty</option>
              <option value="home">Home size — base + per room</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5 pb-3 text-[15px] font-medium text-navy-900">
            <input
              type="checkbox"
              checked={newS.isAddon}
              onChange={(e) => setNewS({ ...newS, isAddon: e.target.checked })}
              className="h-4 w-4 accent-gold-500"
            />
            Offer as add-on
          </label>

          {newS.pricingMode === 'home' && (
            <>
              <input
                type="number" step="0.01" min="0"
                placeholder="+$ per extra bedroom"
                value={newS.perBedroom}
                onChange={(e) => setNewS({ ...newS, perBedroom: e.target.value })}
                className={addInput}
              />
              <input
                type="number" step="0.01" min="0"
                placeholder="+$ per extra bathroom"
                value={newS.perBathroom}
                onChange={(e) => setNewS({ ...newS, perBathroom: e.target.value })}
                className={addInput}
              />
              <p className="col-span-2 bc-meta text-muted">
                Base charge covers a 1-bed · 1-bath home; extras are added per additional room.
              </p>
            </>
          )}
        </div>
      </AddCatalogueItem>

      <ul className="space-y-3">
        {services.map((s) => {
          const d = draft[s._id] || {
            price: s.price, unit: s.unit || '', duration: s.duration || '',
            available: s.available, image: s.image || '',
            pricingMode: s.pricingMode || 'flat',
            perBedroom: s.perBedroom ?? 0, perBathroom: s.perBathroom ?? 0,
            isAddon: !!s.isAddon,
          };

          return (
            <CatalogueRow
              key={s._id}
              title={s.name}
              subtitle={s.description}
              image={d.image}
              fallback="🫧"
              onPickImage={(url) => edit(s._id, 'image', url)}
              onDelete={() => onDelete(s._id)}
              onSave={() => save(s)}
              dirty={isDirty(s)}
              saving={savingId === s._id}
              footer={
                <div className="mt-4 flex flex-wrap items-end gap-4 rounded-btn bg-sky-50 p-4">
                  <RowField label="Pricing">
                    <select
                      value={d.pricingMode}
                      onChange={(e) => edit(s._id, 'pricingMode', e.target.value)}
                      aria-label={`Pricing model for ${s.name}`}
                      className={`w-32 ${rowInput}`}
                    >
                      <option value="flat">Flat</option>
                      <option value="home">Home size</option>
                    </select>
                  </RowField>

                  {d.pricingMode === 'home' && (
                    <>
                      <RowField label="+ per bedroom" prefix="$" width="w-24">
                        <input
                          type="number" step="0.01" min="0"
                          value={d.perBedroom}
                          onChange={(e) => edit(s._id, 'perBedroom', e.target.value)}
                          aria-label={`Per-bedroom uplift for ${s.name}`}
                          className={rowInputBare}
                        />
                      </RowField>

                      <RowField label="+ per bathroom" prefix="$" width="w-24">
                        <input
                          type="number" step="0.01" min="0"
                          value={d.perBathroom}
                          onChange={(e) => edit(s._id, 'perBathroom', e.target.value)}
                          aria-label={`Per-bathroom uplift for ${s.name}`}
                          className={rowInputBare}
                        />
                      </RowField>
                    </>
                  )}

                  <label className="flex items-center gap-2.5 pb-2.5 text-[15px] font-medium text-navy-900">
                    <input
                      type="checkbox"
                      checked={!!d.isAddon}
                      onChange={(e) => edit(s._id, 'isAddon', e.target.checked)}
                      className="h-4 w-4 accent-gold-500"
                    />
                    Add-on
                  </label>
                </div>
              }
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

              <RowField label="Duration">
                <input
                  value={d.duration}
                  onChange={(e) => edit(s._id, 'duration', e.target.value)}
                  aria-label={`Duration for ${s.name}`}
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
            <p className="bc-h4">No cleaning services yet</p>
            <p className="mt-2 bc-meta text-muted">Add your first one above.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
