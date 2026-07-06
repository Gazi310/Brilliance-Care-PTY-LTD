import { useEffect, useState } from 'react';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import AdminOrderRow from '../../components/admin/orders/AdminOrderRow.jsx';
import { SEGMENTS } from '../../components/admin/orders/orderStatusMeta.js';
import { adminListOrders, adminUpdateStatus } from '../../services/orderService.js';

/**
 * /admin/orders — the work queue (blueprint §5.2). Segment lenses across the
 * top, search, and rows that link into the Assess & Invoice screen.
 */
export default function AdminOrders() {
  const [segment, setSegment] = useState('all');
  const [kind, setKind] = useState('');
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Debounce typing → search param.
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setOrders(await adminListOrders({ segment, q, kind }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment, q, kind]);

  /** Inline status change for shop rows (e.g. Mark fulfilled). */
  const quickStatus = async (order, status) => {
    setBusyId(order._id);
    try {
      const updated = await adminUpdateStatus(order._id, status);
      setOrders((list) => list.map((o) => (o._id === updated._id ? updated : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Admin"
        title="Orders & bookings"
        subtitle="Your work queue — tap a booking to assess the job and send the final invoice."
      />

      {/* ---- Segment lenses ---- */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div className="flex w-max items-center gap-1.5">
          {SEGMENTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSegment(s.id)}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                segment === s.id
                  ? 'bg-navy text-white shadow-soft'
                  : 'border border-line bg-white text-muted shadow-soft hover:text-navy'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- Search + kind filter ---- */}
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <input
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search order #, name or phone…"
            className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink shadow-soft placeholder:text-faint focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30"
            aria-label="Search orders"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </div>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-bold text-muted shadow-soft focus:border-aqua focus:outline-none"
          aria-label="Filter by order type"
        >
          <option value="">All types</option>
          <option value="booking">Bookings</option>
          <option value="shop">Shop</option>
        </select>
      </div>

      {/* ---- List ---- */}
      <div className="mt-4 space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="bc-skeleton h-[74px] rounded-2xl" />)
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {error}
            <button
              onClick={load}
              className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center">
            <p className="text-3xl">🗂️</p>
            <p className="mt-2 text-sm font-bold text-ink">Nothing here yet</p>
            <p className="mt-1 text-xs text-muted">
              {segment === 'all' && !q
                ? 'New orders and bookings will appear the moment they land.'
                : 'No orders match this view — try another segment or clear the search.'}
            </p>
          </div>
        ) : (
          orders.map((o) => (
            <AdminOrderRow key={o._id} order={o} onQuickStatus={quickStatus} busy={busyId === o._id} />
          ))
        )}
      </div>
    </div>
  );
}
