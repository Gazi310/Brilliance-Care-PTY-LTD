import { useMemo, useState } from 'react';
import { money } from './orderStatusMeta.js';
import { adminAssessOrder } from '../../../services/orderService.js';

const round2 = (n) => Math.round(n * 100) / 100;
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/* Booked lines keep estQty > 0; lines added during assessment carry estQty 0. */
const bookedOf = (order) => order.lineItems.filter((l) => l.estQty > 0);
const extrasOf = (order) => order.lineItems.filter((l) => !(l.estQty > 0));

const inputCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30';

/**
 * The heart of Assess & Invoice (blueprint §5.3): enter the ACTUAL weight /
 * size / extras next to the original estimate, watch the total and balance
 * recompute live, and save. Locked once the invoice has gone out.
 */
export default function AssessPanel({ order, locked, onSaved }) {
  const assessed = order.actualTotal !== null && order.actualTotal !== undefined;

  const [lines, setLines] = useState(() =>
    bookedOf(order).map((l) => ({
      qty: String(assessed && l.actualQty !== null ? l.actualQty : l.estQty),
      price: String(assessed && l.actualUnitPrice !== null ? l.actualUnitPrice : l.estUnitPrice),
    }))
  );
  const [extras, setExtras] = useState(() =>
    extrasOf(order).map((l) => ({
      label: l.label,
      unit: l.unit || '',
      qty: String(l.actualQty ?? 1),
      price: String(l.actualUnitPrice ?? 0),
    }))
  );
  const [note, setNote] = useState(order.assessmentNote || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(false);

  const booked = bookedOf(order);

  /* ---- live money ---- */
  const totals = useMemo(() => {
    const bookedTotal = lines.reduce((s, l) => s + num(l.qty) * num(l.price), 0);
    const extrasTotal = extras.reduce((s, x) => s + num(x.qty) * num(x.price), 0);
    const actualTotal = round2(bookedTotal + extrasTotal);
    const depositApplied = order.depositStatus === 'paid' ? order.depositAmount : 0;
    return {
      actualTotal,
      delta: round2(actualTotal - order.estimatedTotal),
      depositApplied,
      balanceDue: round2(actualTotal - depositApplied),
    };
  }, [lines, extras, order]);

  const setLine = (i, field, value) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [field]: value } : l)));
  const setExtra = (i, field, value) =>
    setExtras((xs) => xs.map((x, j) => (j === i ? { ...x, [field]: value } : x)));
  const addExtra = () => setExtras((xs) => [...xs, { label: '', unit: '', qty: '1', price: '' }]);
  const removeExtra = (i) => setExtras((xs) => xs.filter((_, j) => j !== i));

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const payload = {
        lines: lines.map((l, index) => ({
          index,
          actualQty: num(l.qty),
          actualUnitPrice: num(l.price),
        })),
        extras: extras
          .filter((x) => x.label.trim())
          .map((x) => ({
            label: x.label.trim(),
            unit: x.unit.trim(),
            qty: num(x.qty),
            unitPrice: num(x.price),
          })),
        note,
      };
      const updated = await adminAssessOrder(order._id, payload);
      onSaved?.(updated);
      setFlash(true);
      setTimeout(() => setFlash(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">
          Assess the job — estimate vs actual
        </p>
        {locked && (
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-bold text-muted">
            🔒 Invoice sent — locked
          </span>
        )}
      </div>

      {/* ---- Booked lines ---- */}
      <div className="mt-3 space-y-3">
        {booked.map((l, i) => {
          const amount = locked
            ? (l.actualAmount ?? l.estAmount)
            : round2(num(lines[i]?.qty) * num(lines[i]?.price));
          return (
            <div key={i} className="rounded-xl border border-line bg-surface/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink">{l.label}</p>
                  <p className="text-[11px] text-muted">
                    est {l.estQty}
                    {l.unit ? ` ${l.unit}` : ''} × {money(l.estUnitPrice)} = {money(l.estAmount)}
                  </p>
                </div>
                <p className="text-sm font-extrabold tabular-nums text-ink">{money(amount)}</p>
              </div>
              {!locked && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-muted">
                      Actual {l.unit ? `(${l.unit})` : 'qty'}
                    </span>
                    <input
                      type="number" min="0" step="0.1" inputMode="decimal"
                      value={lines[i]?.qty ?? ''}
                      onChange={(e) => setLine(i, 'qty', e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-muted">Unit price ($)</span>
                    <input
                      type="number" min="0" step="0.01" inputMode="decimal"
                      value={lines[i]?.price ?? ''}
                      onChange={(e) => setLine(i, 'price', e.target.value)}
                      className={inputCls}
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Extras discovered on site ---- */}
      <div className="mt-4">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">
          Extras added on site
        </p>
        {locked ? (
          extrasOf(order).length ? (
            <div className="mt-2 space-y-1.5">
              {extrasOf(order).map((x, i) => (
                <div key={i} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted">
                    {x.label} ×{x.actualQty}
                    <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800">
                      added
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums text-ink">{money(x.actualAmount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-xs text-muted">None.</p>
          )
        ) : (
          <>
            {extras.map((x, i) => (
              <div key={i} className="mt-2 rounded-xl border border-dashed border-line p-3">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Ironing, stain treatment…"
                    value={x.label}
                    onChange={(e) => setExtra(i, 'label', e.target.value)}
                    className={inputCls}
                    aria-label="Extra service name"
                  />
                  <button
                    type="button"
                    onClick={() => removeExtra(i)}
                    className="rounded-xl border border-line bg-white px-3 text-sm font-bold text-red-500 transition hover:bg-red-50"
                    aria-label={`Remove extra ${x.label || i + 1}`}
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-muted">Qty</span>
                    <input
                      type="number" min="0" step="0.1" inputMode="decimal"
                      value={x.qty}
                      onChange={(e) => setExtra(i, 'qty', e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-muted">Unit price ($)</span>
                    <input
                      type="number" min="0" step="0.01" inputMode="decimal"
                      value={x.price}
                      onChange={(e) => setExtra(i, 'price', e.target.value)}
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-bold text-muted">Unit (opt.)</span>
                    <input
                      type="text"
                      placeholder="kg, item…"
                      value={x.unit}
                      onChange={(e) => setExtra(i, 'unit', e.target.value)}
                      className={inputCls}
                    />
                  </label>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addExtra}
              className="mt-2 w-full rounded-xl border border-dashed border-line bg-white py-2.5 text-sm font-bold text-navy transition hover:bg-surface"
            >
              + Add extra service
            </button>
          </>
        )}
      </div>

      {/* ---- Note to customer ---- */}
      {!locked && (
        <label className="mt-4 block">
          <span className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-faint">
            Note to customer — why it changed
          </span>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Load came in heavier than estimated; added ironing ×5."
            className={`${inputCls} resize-y`}
          />
        </label>
      )}

      {/* ---- Live totals ---- */}
      <div className="mt-4 space-y-1.5 rounded-xl bg-surface px-3.5 py-3 text-sm">
        <div className="flex justify-between text-muted">
          <span>Estimated total</span>
          <span className="tabular-nums">{money(order.estimatedTotal)}</span>
        </div>
        <div className="flex justify-between font-bold text-ink">
          <span>Actual total</span>
          <span className="tabular-nums">
            {money(locked ? order.actualTotal : totals.actualTotal)}
          </span>
        </div>
        {!locked && totals.delta !== 0 && (
          <div className={`flex justify-between text-xs font-bold ${totals.delta > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
            <span>{totals.delta > 0 ? 'Over estimate' : 'Under estimate'}</span>
            <span className="tabular-nums">
              {totals.delta > 0 ? '+' : '−'}{money(Math.abs(totals.delta))}
            </span>
          </div>
        )}
        <div className="flex justify-between text-xs text-muted">
          <span>Deposit {order.depositStatus === 'paid' ? 'paid' : 'unpaid'} ({order.depositPercent}%)</span>
          <span className="tabular-nums">−{money(order.depositStatus === 'paid' ? order.depositAmount : 0)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-1.5 font-extrabold text-ink">
          <span>Balance due</span>
          <span className="tabular-nums">
            {money(locked ? order.balanceDue : totals.balanceDue)}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          ⚠️ {error}
        </p>
      )}

      {!locked && (
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-navy to-aqua py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Saving…' : flash ? 'Saved ✓' : assessed ? 'Update assessment' : 'Save assessment'}
        </button>
      )}
    </section>
  );
}
