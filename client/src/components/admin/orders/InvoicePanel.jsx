import { useState } from 'react';
import { money, timeLabel } from './orderStatusMeta.js';
import { adminCreateInvoice, adminRecordBalance } from '../../../services/orderService.js';
import {
  AlertIcon, MailIcon, ChatIcon, CashIcon, CardIcon, PencilIcon, ReceiptIcon,
} from '../icons.jsx';
import { Panel, Button, Tag, Notice, LineItems } from '../../ui';

const METHOD_LABEL = {
  card_online: 'Paid online by card',
  cash_on_delivery: 'Cash on delivery',
  card_on_delivery: 'Card on delivery',
  waived: 'Balance waived',
  not_required: 'No balance was due',
};

const CHANNELS = [
  { id: 'email', label: 'Email', Icon: MailIcon },
  { id: 'sms', label: 'SMS', Icon: ChatIcon },
];

/**
 * Generate & send the final bill, then settle it (blueprint §5.3).
 * Three states: no invoice yet → send form; sent → awaiting payment with
 * record-on-delivery actions; paid → receipt summary.
 *
 * Phase 8 restyle — the three states, the confirm prompts and the service
 * calls are unchanged. This panel carries the screen's single gold button
 * ("Generate & send"), which is why AssessPanel's save demotes to navy
 * once an assessment exists.
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
    <Panel
      title={
        <>
          <ReceiptIcon width={18} height={18} className="text-navy-500" />
          Invoice
        </>
      }
      action={
        invoice && (
          <Tag tone={invoice.status === 'paid' ? 'ok' : 'warn'}>
            {invoice.status === 'paid' ? 'Paid' : 'Awaiting payment'}
          </Tag>
        )
      }
      padded
    >
      {/* ---------- 1) Not generated yet ---------- */}
      {!invoice && (
        !assessed ? (
          <Notice tone="info">
            Save the assessment above first — the invoice is built from the actuals.
          </Notice>
        ) : (
          <>
            <p className="bc-body text-muted">
              Sends the est-vs-actual bill with a pay link. Balance due{' '}
              <b className="font-bold text-navy-900">{money(order.balanceDue)}</b>.
            </p>

            <div className="mt-4 flex flex-wrap gap-5">
              {CHANNELS.map(({ id, label, Icon }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold text-navy-900"
                >
                  <input
                    type="checkbox"
                    checked={channels[id]}
                    onChange={(e) => setChannels((ch) => ({ ...ch, [id]: e.target.checked }))}
                    className="h-4 w-4 cursor-pointer rounded border-line accent-gold-500"
                  />
                  <Icon width={17} height={17} className="text-navy-500" />
                  {label}
                </label>
              ))}
            </div>

            <Button variant="gold" block className="mt-5" disabled={busy} onClick={generate}>
              {busy ? 'Sending…' : 'Generate & send invoice'}
            </Button>

            <p className="mt-2.5 text-center bc-meta text-muted">
              Notifications are mocked for now — sends are logged here and on the server console.
            </p>
          </>
        )
      )}

      {/* ---------- 2) Generated ---------- */}
      {invoice && (
        <>
          <p className="bc-meta text-muted">
            <b className="font-bold text-navy-900">{invoice.number}</b> · issued{' '}
            {timeLabel(invoice.issuedAt)}
          </p>

          <LineItems
            className="mt-3"
            lines={[
              {
                label: 'Actual total',
                note: `incl. GST ${money(invoice.gstAmount)}`,
                value: money(invoice.total),
              },
              { label: 'Less deposit paid', value: `− ${money(invoice.depositApplied)}` },
              { label: 'Balance due', value: money(invoice.balanceDue), emphasis: 'total' },
            ]}
          />

          {invoice.note && (
            <div className="mt-4 flex gap-3 rounded-btn bg-sky-50 px-4 py-3">
              <PencilIcon width={17} height={17} className="mt-0.5 flex-none text-navy-500" />
              <p className="bc-meta text-muted">
                <b className="font-bold text-navy-900">Note sent:</b> {invoice.note}
              </p>
            </div>
          )}

          {/* Sent log */}
          {invoice.notifications?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {invoice.notifications.map((n, i) => (
                <li key={i} className="flex items-center gap-2 bc-meta text-muted">
                  {n.channel === 'email' ? (
                    <MailIcon width={14} height={14} className="flex-none" />
                  ) : (
                    <ChatIcon width={14} height={14} className="flex-none" />
                  )}
                  Sent via {n.channel}
                  {n.to ? ` to ${n.to}` : ''} · {timeLabel(n.at)}
                </li>
              ))}
            </ul>
          )}

          {/* Awaiting payment → settle actions */}
          {invoice.status === 'sent' && (
            <div className="mt-6 border-t border-line pt-5">
              <p className="bc-meta font-semibold text-navy-900">Settle on delivery</p>
              <p className="mt-1 bc-meta text-muted">
                The customer can pay online from their invoice — or record how they paid on the day.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <Button variant="outline" size="sm" disabled={busy} onClick={() => record('cash')}>
                  <CashIcon width={17} height={17} />
                  Cash
                </Button>
                <Button variant="outline" size="sm" disabled={busy} onClick={() => record('card')}>
                  <CardIcon width={17} height={17} />
                  Card
                </Button>
              </div>

              <div className="mt-3 text-center">
                <Button variant="ghost" disabled={busy} onClick={() => record('waive')}>
                  Waive balance
                </Button>
              </div>
            </div>
          )}

          {/* Paid → receipt */}
          {invoice.status === 'paid' && (
            <Notice tone="ok" className="mt-4">
              <b className="font-bold">Settled</b> — {METHOD_LABEL[invoice.paymentMethod] || 'paid'}
              {invoice.paidAt ? ` · ${timeLabel(invoice.paidAt)}` : ''}
            </Notice>
          )}
        </>
      )}

      {error && (
        <Notice tone="warn" className="mt-4" icon={<AlertIcon className="mt-0.5 flex-none" />}>
          {error}
        </Notice>
      )}
    </Panel>
  );
}
