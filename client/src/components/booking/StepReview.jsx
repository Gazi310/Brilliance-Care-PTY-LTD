import { Card, Notice } from '../ui';
import { BasketIcon, BubblesIcon, SparkleIcon } from './icons.jsx';

const KIND_ICON = { laundry: BasketIcon, cleaning: BubblesIcon, addon: SparkleIcon };

function EditButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-none text-xs font-bold text-navy-500 underline decoration-2 underline-offset-4 transition hover:text-navy-900"
    >
      Edit
    </button>
  );
}

function SummaryRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="bc-eyebrow">{label}</p>
        <div className="mt-0.5 text-[15px] font-semibold text-ink">{value}</div>
      </div>
      {onEdit && <EditButton onClick={onEdit} />}
    </div>
  );
}

const slotText = (s) => (s ? `${s.dateLabel || s.date} · ${s.label} (${s.time})` : '—');

/**
 * Booking step 4 — the itemised estimate, deposit maths, chosen slots and
 * address, plus the terms tick. The primary CTA lives in the flow's sticky bar.
 */
export default function StepReview({
  lines,
  estimatedTotal,
  gstAmount,
  depositPercent,
  depositAmount,
  balancePreview,
  hasLaundry,
  hasCleaning,
  pickupSlot,
  returnSlot,
  cleaningSlot,
  details,
  goTo,
  terms,
  setTerms,
  signedIn,
}) {
  return (
    <div className="space-y-4">
      {/* ---- Estimated order ---- */}
      <Card as="section">
        <div className="flex items-center justify-between">
          <p className="bc-eyebrow">Estimated order</p>
          <EditButton onClick={() => goTo(1)} />
        </div>
        <div className="mt-3 divide-y divide-line">
          {lines.map((l) => {
            const Icon = KIND_ICON[l.kind];
            return (
              <div key={`${l.kind}-${l.serviceId}`} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  {Icon && <Icon width={18} height={18} className="flex-none text-navy-500" aria-hidden="true" />}
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-ink">{l.label}</p>
                    <p className="text-xs text-muted">
                      {l.qty > 1 || l.kind !== 'cleaning' ? `~${l.qty} × $${l.unitPrice.toFixed(2)}` : l.unit}
                    </p>
                  </div>
                </div>
                <span className="text-[15px] font-bold tabular-nums text-navy-900">${l.amount.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 space-y-2 border-t border-line pt-4 text-[15px]">
          <div className="flex justify-between text-muted">
            <span>GST (included)</span>
            <span className="font-semibold tabular-nums">${gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-display text-lg font-bold text-navy-900">
            <span>Estimated total</span>
            <span className="tabular-nums">${estimatedTotal.toFixed(2)}</span>
          </div>
          <div className="-mx-2 flex justify-between rounded-btn bg-gold-100 px-4 py-3 font-bold text-navy-900">
            <span>Deposit now ({depositPercent}%)</span>
            <span className="tabular-nums">${depositAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Balance after service</span>
            <span className="font-semibold tabular-nums">~${balancePreview.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* ---- Slots & address ----
           Not <Card>: each SummaryRow brings its own vertical padding and
           divider, so the card's p-6 would double it. Same surface, tighter
           block padding — written out rather than overriding p-6 with py-2,
           which would leave two padding utilities racing on one element. */}
      <section className="bc-card-light rounded-card border border-line bg-white px-6 py-2 shadow-card lg:px-8">
        {hasLaundry && (
          <>
            <SummaryRow label="Laundry pickup" value={slotText(pickupSlot)} onEdit={() => goTo(2)} />
            <SummaryRow label="Laundry return" value={slotText(returnSlot)} onEdit={() => goTo(2)} />
          </>
        )}
        {hasCleaning && (
          <SummaryRow label="Cleaning appointment" value={slotText(cleaningSlot)} onEdit={() => goTo(2)} />
        )}
        <SummaryRow
          label="Address"
          value={`${details.line1}, ${details.suburb} ${details.state} ${details.postcode}`}
          onEdit={() => goTo(3)}
        />
        <SummaryRow label="Contact" value={`${details.name} · ${details.phone}`} onEdit={() => goTo(3)} />
        {details.accessNotes && <SummaryRow label="Access notes" value={details.accessNotes} onEdit={() => goTo(3)} />}
      </section>

      {/* ---- How the invoice works ---- */}
      <Notice tone="info">
        The final price is confirmed after we {hasLaundry ? 'weigh your load' : 'see your home'}
        {hasLaundry && hasCleaning ? ' and see your home' : ''}. We'll send an{' '}
        <b className="font-bold">invoice</b> showing any changes — you only pay the balance then.
      </Notice>

      {/* ---- Terms ---- */}
      <label className="flex cursor-pointer items-start gap-3 px-1 text-sm leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-navy-900"
        />
        <span>
          I understand prices are <b className="font-semibold text-ink">estimates</b> and agree to the terms of
          service.
        </span>
      </label>

      {!signedIn && (
        <p className="rounded-card bg-sky-50 px-4 py-3 text-[13px] font-semibold text-muted">
          You'll be asked to sign in (or create an account) before paying the deposit — your booking
          details are saved.
        </p>
      )}
    </div>
  );
}
