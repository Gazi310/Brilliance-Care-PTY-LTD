import { useState } from 'react';
import { money } from './orderStatusMeta.js';
import { adminCreateInvoice, adminRecordBalance } from '../../../services/orderService.js';

const timeLabel = (iso) =>
  new Date(iso).toLocaleString('en-AU', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });

const METHOD_LABEL = {
  card_online: 'Paid online by card',
  cash_on_delivery: 'Cash on delivery',
  card_on_delivery: 'Card on delivery',
  waived: 'Balance waived',
  not_required: 'No balance was due',
};

/**
 * Generate & send the final bill, then settle it (blueprint §5.3).
 * Three states: no invoice yet → send form; sent → awaiting payment with
 * record-on-delivery actions; paid → receipt summary.
 */
export default function InvoicePanel({ order, invoice, onChanged }) {
  const [channels, setChannels] = useState({ email: true, sms: true });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const assessed = order.actualTotal !== null && order.actualTotal !== undefined;

  const generate = async () => {
    setBusy(true);
    setError('');
    try {
      const picked = Object.keys(channels).filter((c) => channels[c]);
      const res = await adminCreateInvoice(order._id, {
        channels: picked.length ? picked : ['email'],
        note: order.assessmentNote || '',
      });
      onChanged?.(res.order, res.invoice);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const record = async (method) => {
    const label = method === 'waive' ? 'waive the remaining balance' : `record a ${method} payment`;
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;
    setBusy(true);
    setError('');
    try {
      const res = await adminRecordBalance(order._id, method);
      onChanged?.(res.order, res.invoice);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Invoice</p>

      {/* ---------- 1) Not generated yet ---------- */}
      {!invoice && (
        <>
          {!assessed ? (
            <p className="mt-2 rounded-xl bg-surface px-3.5 py-3 text-xs font-semibold text-muted">
              Save the assessment above first — the invoice is built from the actuals.
            </p>
          ) : (
            <>
              <p className="mt-2 text-xs text-muted">
                Sends the est-vs-actual bill with a pay link. Balance due:{' '}
                <b className="text-ink">{money(order.balanceDue)}</b>
              </p>
              <div className="mt-3 flex gap-4">
                {['email', 'sms'].map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm font-bold text-ink">
                    <input
                      type="checkbox"
                      checked={channels[c]}
                      onChange={(e) => setChannels((ch) => ({ ...ch, [c]: e.target.checked }))}
                      className="h-4 w-4 rounded border-line accent-navy"
                    />
                    {c === 'email' ? '✉️ Email' : '💬 SMS'}
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={generate}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? 'Sending…' : '🧾 Generate & send invoice'}
              </button>
              <p className="mt-2 text-center text-[11px] text-faint">
                Notifications are mocked for now — sends are logged here and on the server console.
              </p>
            </>
          )}
        </>
      )}

      {/* ---------- 2) Generated ---------- */}
      {invoice && (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-ink">{invoice.number}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                invoice.status === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {invoice.status === 'paid' ? 'Paid' : 'Awaiting payment'}
            </span>
            <span className="text-[11px] text-faint">issued {timeLabel(invoice.issuedAt)}</span>
          </div>

          <div className="mt-3 space-y-1.5 rounded-xl bg-surface px-3.5 py-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Actual total (incl. GST {money(invoice.gstAmount)})</span>
              <span className="tabular-nums">{money(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Less deposit paid</span>
              <span className="tabular-nums">−{money(invoice.depositApplied)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-1.5 font-extrabold text-ink">
              <span>Balance due</span>
              <span className="tabular-nums">{money(invoice.balanceDue)}</span>
            </div>
          </div>

          {invoice.note && (
            <p className="mt-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-slate-600">
              📝 <b>Note sent:</b> {invoice.note}
            </p>
          )}

          {/* Sent log */}
          {invoice.notifications?.length > 0 && (
            <div className="mt-2 space-y-1">
              {invoice.notifications.map((n, i) => (
                <p key={i} className="text-[11px] text-faint">
                  {n.channel === 'email' ? '✉️' : '💬'} Sent via {n.channel}
                  {n.to ? ` to ${n.to}` : ''} · {timeLabel(n.at)}
                </p>
              ))}
            </div>
          )}

          {/* Awaiting payment → settle actions */}
          {invoice.status === 'sent' && (
            <>
              <p className="mt-3 text-xs text-muted">
                The customer can pay online from their invoice — or record how they paid on delivery:
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button" disabled={busy} onClick={() => record('cash')}
                  className="rounded-xl border border-line bg-white py-2.5 text-sm font-bold text-ink shadow-soft transition hover:bg-surface disabled:opacity-50"
                >
                  💵 Cash on delivery
                </button>
                <button
                  type="button" disabled={busy} onClick={() => record('card')}
                  className="rounded-xl border border-line bg-white py-2.5 text-sm font-bold text-ink shadow-soft transition hover:bg-surface disabled:opacity-50"
                >
                  💳 Card on delivery
                </button>
              </div>
              <button
                type="button" disabled={busy} onClick={() => record('waive')}
                className="mt-2 w-full rounded-xl py-2 text-xs font-bold text-faint transition hover:text-red-500"
              >
                Waive balance
              </button>
            </>
          )}

          {/* Paid → receipt */}
          {invoice.status === 'paid' && (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm font-bold text-emerald-800">
              ✅ Settled — {METHOD_LABEL[invoice.paymentMethod] || 'paid'}
              {invoice.paidAt ? ` · ${timeLabel(invoice.paidAt)}` : ''}
            </p>
          )}
        </>
      )}

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          ⚠️ {error}
        </p>
      )}
    </section>
  );
}
