import { useMemo, useState } from 'react';
import { money } from './orderStatusMeta.js';
import { adminAssessOrder } from '../../../services/orderService.js';
import { AlertIcon, LockIcon, CloseIcon, PlusIcon } from '../icons.jsx';
import { Panel, Button, Tag, Notice, Field, LineItems, DataTable } from '../../ui';

const round2 = (n) => Math.round(n * 100) / 100;
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/* Booked lines keep estQty > 0; lines added during assessment carry estQty 0. */
const bookedOf = (order) => order.lineItems.filter((l) => l.estQty > 0);
const extrasOf = (order) => order.lineItems.filter((l) => !(l.estQty > 0));

const COLUMNS = [
  { key: 'line', label: 'Line' },
  { key: 'estimated', label: 'Estimated' },
  { key: 'qty', label: 'Actual qty' },
  { key: 'price', label: 'Unit price' },
  { key: 'amount', label: 'Actual $', align: 'right' },
];

/** The number input that appears in the qty and unit-price cells. */
const cellInput = 'h-[42px] w-[110px] rounded-btn border border-line bg-white px-3 text-[15px] text-ink';

/**
 * The heart of Assess & Invoice (blueprint §5.3): enter the ACTUAL weight /
 * size / extras next to the original estimate, watch the total and balance
 * recompute live, and save. Locked once the invoice has gone out.
 *
 * Phase 8 restyle. The maths, the payload shape and the locking rules are
 * untouched — this file is the closest thing the business has to a till,
 * and the brief for this phase is appearance only. What changed is that
 * the estimate and the actual now sit in one table row rather than in a
 * stacked card, which is what the wireframe does and what makes the
 * comparison readable at a glance.
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

  const shownTotal = locked ? order.actualTotal : totals.actualTotal;
  const shownBalance = locked ? order.balanceDue : totals.balanceDue;

  /* ---- table rows ----
     Booked lines first, then anything added on site. Once the invoice is
     locked every cell is read-only text; before that, qty and unit price
     are live inputs and the extras are editable in place. */
  const lineCell = (label, sub) => (
    <>
      <strong className="font-bold text-navy-900">{label}</strong>
      <span className="mt-0.5 block text-[13px] text-muted">{sub}</span>
    </>
  );

  const bookedRows = booked.map((l, i) => {
    const amount = locked
      ? (l.actualAmount ?? l.estAmount)
      : round2(num(lines[i]?.qty) * num(lines[i]?.price));

    return {
      id: `b-${i}`,
      line: lineCell(l.label, `${money(l.estUnitPrice)} per ${l.unit || 'item'}`),
      estimated: (
        <span className="whitespace-nowrap text-muted">
          {l.estQty}
          {l.unit ? ` ${l.unit}` : ''} · {money(l.estAmount)}
        </span>
      ),
      qty: locked ? (
        <span className="text-muted">{l.actualQty ?? l.estQty}</span>
      ) : (
        <input
          type="number" min="0" step="0.1" inputMode="decimal"
          value={lines[i]?.qty ?? ''}
          onChange={(e) => setLine(i, 'qty', e.target.value)}
          aria-label={`Actual ${l.unit || 'quantity'} for ${l.label}`}
          className={cellInput}
        />
      ),
      price: locked ? (
        <span className="text-muted">{money(l.actualUnitPrice ?? l.estUnitPrice)}</span>
      ) : (
        <input
          type="number" min="0" step="0.01" inputMode="decimal"
          value={lines[i]?.price ?? ''}
          onChange={(e) => setLine(i, 'price', e.target.value)}
          aria-label={`Actual unit price for ${l.label}`}
          className={cellInput}
        />
      ),
      // Under the estimate is good news and gets the green — it's the
      // single number the customer reacts to on the invoice.
      amount: (
        <span className={`tabular-nums ${amount < l.estAmount ? 'text-ok' : 'text-navy-900'}`}>
          {money(amount)}
        </span>
      ),
    };
  });

  const extraRows = locked
    ? extrasOf(order).map((x, i) => ({
        id: `x-${i}`,
        extra: true,
        line: lineCell(x.label, 'Extra — agreed with customer on site'),
        estimated: <span className="text-muted">Not estimated</span>,
        qty: <span className="text-muted">{x.actualQty}</span>,
        price: <span className="text-muted">{money(x.actualUnitPrice)}</span>,
        amount: <span className="tabular-nums text-navy-900">{money(x.actualAmount)}</span>,
      }))
    : extras.map((x, i) => ({
        id: `x-${i}`,
        extra: true,
        line: (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Ironing, stain treatment…"
              value={x.label}
              onChange={(e) => setExtra(i, 'label', e.target.value)}
              aria-label="Extra service name"
              className="h-[42px] min-w-0 flex-1 rounded-btn border border-line bg-white px-3 text-[15px] text-ink"
            />
            <button
              type="button"
              onClick={() => removeExtra(i)}
              aria-label={`Remove extra ${x.label || i + 1}`}
              className="grid h-[42px] w-[42px] flex-none place-items-center rounded-btn border border-line bg-white text-bad transition-colors hover:bg-bad-bg"
            >
              <CloseIcon width={16} height={16} />
            </button>
          </div>
        ),
        estimated: <span className="text-muted">Not estimated</span>,
        qty: (
          <input
            type="number" min="0" step="0.1" inputMode="decimal"
            value={x.qty}
            onChange={(e) => setExtra(i, 'qty', e.target.value)}
            aria-label="Extra quantity"
            className={cellInput}
          />
        ),
        price: (
          <div className="flex gap-2">
            <input
              type="number" min="0" step="0.01" inputMode="decimal"
              value={x.price}
              onChange={(e) => setExtra(i, 'price', e.target.value)}
              aria-label="Extra unit price"
              className={cellInput}
            />
            <input
              type="text"
              placeholder="unit"
              value={x.unit}
              onChange={(e) => setExtra(i, 'unit', e.target.value)}
              aria-label="Extra unit (optional)"
              className="h-[42px] w-[74px] rounded-btn border border-line bg-white px-3 text-[15px] text-ink"
            />
          </div>
        ),
        amount: (
          <span className="tabular-nums text-navy-900">
            {money(round2(num(x.qty) * num(x.price)))}
          </span>
        ),
      }));

  const tableRows = [...bookedRows, ...extraRows];

  return (
    <div className="space-y-5">
      <Panel
        title="Estimated vs actual"
        action={
          locked && (
            <Tag tone="neutral" className="gap-1.5">
              <LockIcon width={13} height={13} />
              Invoice sent — locked
            </Tag>
          )
        }
      >
        <DataTable
          flush
          columns={COLUMNS}
          rows={tableRows}
          rowClassName={(r) => (r.extra && !locked ? 'bg-sand-50' : '')}
          empty="This booking has no lines to assess."
        />

        {!locked && (
          <div className="border-t border-line px-6 py-4">
            <Button variant="outline" size="sm" onClick={addExtra}>
              <PlusIcon width={16} height={16} />
              Add a line
            </Button>
          </div>
        )}
      </Panel>

      {/* ---- Note to customer ---- */}
      {!locked ? (
        <Panel title="Notes for the customer" padded>
          <Field
            id="assess-note"
            as="textarea"
            size="sm"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Load came in at 12.8kg — charged as 1.6 loads rather than the estimated 2."
            hint="Appears on the invoice. This is where a lower-than-estimate total gets explained — it's the single biggest driver of repeat bookings."
          />
        </Panel>
      ) : (
        order.assessmentNote && (
          <Panel title="Notes for the customer" padded>
            <p className="bc-body text-muted">{order.assessmentNote}</p>
          </Panel>
        )
      )}

      {/* ---- Over-estimate warning: the one thing that causes disputes ---- */}
      {!locked && totals.delta > 0 && (
        <Notice tone="warn">
          <strong>The actual total is above the estimate.</strong> Confirm the customer agreed to
          the extra {money(totals.delta)} before sending, or adjust the lines above. Explain it in
          the note either way.
        </Notice>
      )}

      {/* ---- Live totals ---- */}
      <Panel title="Invoice preview" padded>
        <LineItems
          lines={[
            { label: 'Original estimate', value: money(order.estimatedTotal) },
            { label: 'Assessed total', value: money(shownTotal) },
            ...(totals.delta !== 0 && !locked
              ? [{
                  label: totals.delta > 0 ? 'Over estimate' : 'Under estimate',
                  value: `${totals.delta > 0 ? '+ ' : '− '}${money(Math.abs(totals.delta))}`,
                }]
              : []),
            {
              label: `Deposit ${order.depositStatus === 'paid' ? 'paid' : 'unpaid'} (${order.depositPercent}%)`,
              value: `− ${money(order.depositStatus === 'paid' ? order.depositAmount : 0)}`,
            },
            { label: 'Balance due', value: money(shownBalance), emphasis: 'total' },
          ]}
        />

        {error && (
          <Notice tone="warn" className="mt-5" icon={<AlertIcon className="mt-0.5 flex-none" />}>
            {error}
          </Notice>
        )}

        {/* Gold until it's saved, then demoted — once the assessment exists the
            primary action on this screen is "Generate & send invoice" in the
            panel below, and two golds would make neither of them mean "next". */}
        {!locked && (
          <Button
            variant={assessed ? 'navy' : 'gold'}
            block
            className="mt-6"
            disabled={busy}
            onClick={save}
          >
            {busy ? 'Saving…' : flash ? 'Saved ✓' : assessed ? 'Update assessment' : 'Save assessment'}
          </Button>
        )}
      </Panel>
    </div>
  );
}
