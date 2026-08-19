import { useState } from 'react';
import CatalogueRow, { RowField, rowInputBare, LiveToggle }
  from '../admin/catalogue/CatalogueRow.jsx';
import AddCatalogueItem, { addInput } from '../admin/catalogue/AddCatalogueItem.jsx';
import { Tag } from '../ui';

const CATEGORIES = ['Laundry', 'Cleaning', 'Eco-Friendly', 'Accessories', 'General'];

const BLANK = { name: '', category: 'Laundry', price: '', stock: '', image: '' };

/**
 * Product inventory manager, rendered inline on /admin/products.
 *
 * Phase 8 restyle — matching the laundry and cleaning managers: shared
 * row shell from components/admin/catalogue/, dead drawer branch
 * removed, violet/gray palette replaced with navy & gold.
 *
 * One addition beyond styling: a low-stock <Tag> on rows at or below 5.
 * Low stock is already surfaced on the dashboard's needs-action panel,
 * and this is the screen you land on to fix it — arriving here and
 * having to re-find which item was low was the gap.
 */
const LOW_STOCK_AT = 5;

export default function AdminPanel({ products, onSave, onDelete, onCreate, savingId }) {
  const [draft, setDraft] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newP, setNewP] = useState(BLANK);

  // Keep a local editable copy of each product in sync with the latest data
  // (synced during render, not in an effect, to avoid cascading renders).
  const [syncedProducts, setSyncedProducts] = useState(null);
  if (syncedProducts !== products) {
    const d = {};
    for (const p of products)
      d[p._id] = { price: p.price, stock: p.stock, available: p.available, image: p.image || '' };
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
    <div className="space-y-5">
      <AddCatalogueItem
        label="Add a product"
        open={showAdd}
        onToggle={() => setShowAdd((v) => !v)}
        onSubmit={submitNew}
        creating={creating}
        image={newP.image}
        onPickImage={(url) => setNewP((p) => ({ ...p, image: url }))}
        onImageUrl={(v) => setNewP((p) => ({ ...p, image: v }))}
      >
        <input
          required
          placeholder="Product name"
          value={newP.name}
          onChange={(e) => setNewP({ ...newP, name: e.target.value })}
          className={`col-span-2 ${addInput}`}
        />
        <select
          value={newP.category}
          onChange={(e) => setNewP({ ...newP, category: e.target.value })}
          aria-label="Product category"
          className={addInput}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="number" step="0.01" min="0" required
          placeholder="Price ($)"
          value={newP.price}
          onChange={(e) => setNewP({ ...newP, price: e.target.value })}
          className={addInput}
        />
        <input
          type="number" min="0" required
          placeholder="Stock qty"
          value={newP.stock}
          onChange={(e) => setNewP({ ...newP, stock: e.target.value })}
          className={`col-span-2 ${addInput}`}
        />
      </AddCatalogueItem>

      <ul className="space-y-3">
        {products.map((p) => {
          const d = draft[p._id] || {
            price: p.price, stock: p.stock, available: p.available, image: p.image || '',
          };
          const low = Number(d.stock) <= LOW_STOCK_AT;

          return (
            <CatalogueRow
              key={p._id}
              title={p.name}
              subtitle={
                <>
                  {p.category}
                  {low && (
                    <Tag tone={Number(d.stock) === 0 ? 'bad' : 'warn'} className="ml-2.5">
                      {Number(d.stock) === 0 ? 'Out of stock' : 'Low stock'}
                    </Tag>
                  )}
                </>
              }
              image={d.image}
              fallback="🧴"
              onPickImage={(url) => edit(p._id, 'image', url)}
              onDelete={() => onDelete(p._id)}
              onSave={() => save(p)}
              dirty={isDirty(p)}
              saving={savingId === p._id}
            >
              {/* Stock stepper */}
              <RowField label="Stock qty">
                <div className="inline-flex h-10 items-center overflow-hidden rounded-btn border border-line bg-white">
                  <button
                    type="button"
                    onClick={() => edit(p._id, 'stock', Math.max(0, Number(d.stock) - 1))}
                    aria-label={`Decrease stock for ${p.name}`}
                    className="h-full px-3 font-bold text-navy-900 transition-colors hover:bg-sky-50"
                  >
                    −
                  </button>
                  <input
                    type="number" min="0"
                    value={d.stock}
                    onChange={(e) => edit(p._id, 'stock', e.target.value)}
                    aria-label={`Stock for ${p.name}`}
                    className="h-full w-16 border-x border-line text-center text-[15px] text-ink outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => edit(p._id, 'stock', Number(d.stock) + 1)}
                    aria-label={`Increase stock for ${p.name}`}
                    className="h-full px-3 font-bold text-navy-900 transition-colors hover:bg-sky-50"
                  >
                    +
                  </button>
                </div>
              </RowField>

              <RowField label="Price" prefix="$" width="w-28">
                <input
                  type="number" step="0.01" min="0"
                  value={d.price}
                  onChange={(e) => edit(p._id, 'price', e.target.value)}
                  aria-label={`Price for ${p.name}`}
                  className={rowInputBare}
                />
              </RowField>

              <LiveToggle
                on={d.available}
                onToggle={() => edit(p._id, 'available', !d.available)}
                label={`Toggle availability for ${p.name}`}
              />
            </CatalogueRow>
          );
        })}

        {products.length === 0 && (
          <li className="rounded-card border border-dashed border-line bg-white px-6 py-12 text-center">
            <p className="bc-h4">No products yet</p>
            <p className="mt-2 bc-meta text-muted">Add your first one above.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
