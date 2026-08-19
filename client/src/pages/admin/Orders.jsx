import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import AdminOrderRow from '../../components/admin/orders/AdminOrderRow.jsx';
import { SEGMENTS } from '../../components/admin/orders/orderStatusMeta.js';
import { adminListOrders, adminUpdateStatus } from '../../services/orderService.js';
import { SearchIcon } from '../../components/products/icons.jsx';
import { AlertIcon } from '../../components/admin/icons.jsx';
import { Chip, Button, Notice } from '../../components/ui';

const SEGMENT_IDS = SEGMENTS.map((s) => s.id);

/**
 * /admin/orders — the work queue (blueprint §5.2). Segment lenses across the
 * top, search, and rows that link into the Assess & Invoice screen.
 * The active segment lives in the URL (?segment=) so the dashboard's
 * needs-action cards can deep-link straight into a lens.
 */
export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSegment = searchParams.get('segment');
  const segment = SEGMENT_IDS.includes(urlSegment) ? urlSegment : 'all';
  const setSegment = (id) =>
    setSearchParams(id === 'all' ? {} : { segment: id }, { replace: true });
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
    <AdminPage>
      <AdminSectionHeader
        eyebrow="Orders"
        title="Work queue"
        subtitle="Open a booking to assess the job and send the final invoice."
        action={
          <>
            <div className="relative">
              <input
                type="search"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                placeholder="Search order, name or phone…"
                aria-label="Search orders"
                className="h-11 w-full rounded-btn border border-line bg-white pl-10 pr-4 text-[15px] text-ink placeholder:text-muted sm:w-[260px]"
              />
              <SearchIcon
                width={17}
                height={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>

            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              aria-label="Filter by order type"
              className="h-11 rounded-btn border border-line bg-white px-4 text-[15px] font-semibold text-navy-900"
            >
              <option value="">All types</option>
              <option value="booking">Bookings</option>
              <option value="shop">Shop</option>
            </select>
          </>
        }
      />

      {/* ---- Segment lenses ---- */}
      <div className="-mx-4 mb-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-2">
          {SEGMENTS.map((s) => (
            <Chip
              key={s.id}
              active={segment === s.id}
              onClick={() => setSegment(s.id)}
              className="whitespace-nowrap"
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* ---- List ---- */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bc-skeleton h-[84px] rounded-card" />
          ))
        ) : error ? (
          <Notice tone="warn" icon={<AlertIcon className="mt-0.5 flex-none" />}>
            <p>{error}</p>
            <Button variant="ghost" onClick={load} className="mt-2">
              Retry
            </Button>
          </Notice>
        ) : orders.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-white px-6 py-14 text-center">
            <p className="bc-h3">Nothing in this view</p>
            <p className="mx-auto mt-2 max-w-md bc-body text-muted">
              {segment === 'all' && !q
                ? 'New orders and bookings appear here the moment they land.'
                : 'No orders match — try another segment or clear the search.'}
            </p>
          </div>
        ) : (
          orders.map((o) => (
            <AdminOrderRow key={o._id} order={o} onQuickStatus={quickStatus} busy={busyId === o._id} />
          ))
        )}
      </div>
    </AdminPage>
  );
}
