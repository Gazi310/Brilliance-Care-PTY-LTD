import { useEffect, useState } from 'react';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import CustomerRow from '../../components/admin/customers/CustomerRow.jsx';
import { adminListCustomers } from '../../services/adminService.js';
import { SearchIcon } from '../../components/products/icons.jsx';
import { AlertIcon } from '../../components/admin/icons.jsx';
import { Button, Notice } from '../../components/ui';

/**
 * /admin/customers (blueprint §5.7) — registered accounts plus guests
 * grouped by the phone number on their bookings. Search covers name,
 * email and phone.
 */
export default function AdminCustomers() {
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce typing → search param.
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminListCustomers(q);
      setCustomers(data.customers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <AdminPage>
      <AdminSectionHeader
        eyebrow="Customers"
        title={loading ? 'Customers' : `${customers.length} customer${customers.length === 1 ? '' : 's'}`}
        subtitle="Accounts and guest bookings, with balances at a glance."
        action={
          <div className="relative">
            <input
              type="search"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder="Search name, email or phone…"
              aria-label="Search customers"
              className="h-11 w-full rounded-btn border border-line bg-white pl-10 pr-4 text-[15px] text-ink placeholder:text-muted sm:w-[280px]"
            />
            <SearchIcon
              width={17}
              height={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        }
      />

      <Notice tone="info" className="mb-6">
        <strong>Guests are grouped by phone number.</strong> They show with a{' '}
        <code className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-[13px]">guest:</code>{' '}
        prefix and merge into an account if someone later signs up with the same number.
      </Notice>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bc-skeleton h-[80px] rounded-card" />
          ))
        ) : error ? (
          <Notice tone="warn" icon={<AlertIcon className="mt-0.5 flex-none" />}>
            <p>{error}</p>
            <Button variant="ghost" onClick={load} className="mt-2">
              Retry
            </Button>
          </Notice>
        ) : customers.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-white px-6 py-14 text-center">
            <p className="bc-h3">{q ? 'No customers match that search' : 'No customers yet'}</p>
            <p className="mx-auto mt-2 max-w-md bc-body text-muted">
              {q
                ? 'Try a different name, email or phone number.'
                : 'Customers appear here as soon as they register or book.'}
            </p>
          </div>
        ) : (
          customers.map((c) => <CustomerRow key={c.id} customer={c} />)
        )}
      </div>
    </AdminPage>
  );
}
