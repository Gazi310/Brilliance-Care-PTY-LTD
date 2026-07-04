const KIND_ICON = { laundry: '🧺', cleaning: '🫧', addon: '✨' };

function SummaryRow({ label, value, onEdit }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">{label}</p>
        <div className="text-sm font-semibold text-ink">{value}</div>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex-none text-xs font-bold text-aqua-d underline-offset-2 transition hover:underline"
        >
          Edit
        </button>
      )}
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
      <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Estimated order</p>
          <button
            type="button"
            onClick={() => goTo(1)}
            className="text-xs font-bold text-aqua-d underline-offset-2 transition hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="mt-2 divide-y divide-line">
          {lines.map((l) => (
            <div key={`${l.kind}-${l.serviceId}`} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {KIND_ICON[l.kind]} {l.label}
                </p>
                <p className="text-[11px] text-faint">
                  {l.qty > 1 || l.kind !== 'cleaning' ? `~${l.qty} × $${l.unitPrice.toFixed(2)}` : l.unit}
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums text-ink">${l.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-2 space-y-1.5 border-t border-line pt-3 text-sm">
          <div className="flex justify-between text-muted">
            <span>GST (included)</span>
            <span className="font-semibold tabular-nums">${gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-ink">
            <span>Estimated total</span>
            <span className="tabular-nums">${estimatedTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-aqua/10 px-2 py-1.5 font-bold text-navy">
            <span>Deposit now ({depositPercent}%)</span>
            <span className="tabular-nums">${depositAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Balance after service</span>
            <span className="font-semibold tabular-nums">~${balancePreview.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* ---- Slots & address ---- */}
      <section className="rounded-2xl border border-line bg-white px-4 py-2 shadow-soft sm:px-5">
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
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-800">
        <span aria-hidden="true" className="text-base">🧾</span>
        <p>
          The final price is confirmed after we {hasLaundry ? 'weigh your load' : 'see your home'}
          {hasLaundry && hasCleaning ? ' and see your home' : ''}. We'll send an{' '}
          <b className="font-bold text-amber-900">invoice</b> showing any changes — you only pay the balance then.
        </p>
      </div>

      {/* ---- Terms ---- */}
      <label className="flex cursor-pointer items-start gap-3 px-1 text-[13px] leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-aqua"
        />
        <span>
          I understand prices are <b className="font-semibold text-ink">estimates</b> and agree to the terms of
          service.
        </span>
      </label>

      {!signedIn && (
        <p className="rounded-xl border border-line bg-surface px-3 py-2.5 text-xs font-semibold text-muted">
          🔐 You'll be asked to sign in (or create an account) before paying the deposit — your booking
          details are saved.
        </p>
      )}
    </div>
  );
}
