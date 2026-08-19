import { useState } from 'react';
import {
  statusPill,
  BOOKING_SET_STATUSES,
  SHOP_SET_STATUSES,
} from './orderStatusMeta.js';
import { adminUpdateStatus } from '../../../services/orderService.js';
import { AlertIcon } from '../icons.jsx';
import { Panel, Button, Tag, Notice } from '../../ui';

/**
 * Move an order through its lifecycle. `assessed` and booking `paid` are
 * reached through the assess & payment flows, so they never appear here —
 * that keeps the status and the money records honest with each other.
 */
export default function StatusControl({ order, onChanged }) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isBooking = order.kind === 'booking';
  const options = isBooking ? BOOKING_SET_STATUSES : SHOP_SET_STATUSES;
  const [tone, label] = statusPill(order.status);
  const closed = order.status === 'cancelled' || order.status === 'paid';

  const apply = async (status) => {
    if (!status || status === order.status) return;
    if (status === 'cancelled' && !window.confirm('Cancel this order? This cannot be undone here.')) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const updated = await adminUpdateStatus(order._id, status);
      setValue('');
      onChanged?.(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel title="Status" action={<Tag tone={tone}>{label}</Tag>} padded>
      {closed ? (
        <p className="bc-body text-muted">
          This order is closed. Nothing further to set here.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={busy}
              aria-label="Move to status"
              className="h-11 min-w-[200px] flex-1 rounded-btn border border-line bg-white px-4 text-[15px] font-semibold text-navy-900"
            >
              <option value="">Move to…</option>
              {options
                .filter((s) => s !== order.status)
                .map((s) => (
                  <option key={s} value={s}>
                    {statusPill(s)[1]}
                  </option>
                ))}
            </select>

            <Button variant="navy" size="sm" disabled={busy || !value} onClick={() => apply(value)}>
              {busy ? 'Saving…' : 'Update'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => apply('cancelled')}
              className="text-bad shadow-[inset_0_0_0_2px_var(--color-bad)] hover:bg-bad-bg"
            >
              Cancel order
            </Button>
          </div>

          {isBooking && (
            <p className="mt-3 bc-meta text-muted">
              “Assessed” is set when you save actuals below; the order closes as Paid once it’s
              delivered and the balance is settled.
            </p>
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
