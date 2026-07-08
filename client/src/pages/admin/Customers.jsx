import { useEffect, useState } from 'react';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import CustomerRow from '../../components/admin/customers/CustomerRow.jsx';
import { adminListCustomers } from '../../services/adminService.js';

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
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Admin"
        title="Customers"
        subtitle="Everyone you've served — accounts and guest bookings, with balances at a glance."
      />

      <div className="relative">
        <input
          type="search"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Search name, email or phone…"
          className="w-full rounded-xl border border-line bg-white py-2.5 pl-9 pr-3 text-sm text-ink shadow-soft placeholder:text-faint focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30"
          aria-label="Search customers"
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

      <div className="mt-4 space-y-2.5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bc-skeleton h-[70px] rounded-2xl" />
          ))
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
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-center">
            <p className="text-3xl">👥</p>
            <p className="mt-2 text-sm font-bold text-ink">
              {q ? 'No customers match that search' : 'No customers yet'}
            </p>
            <p className="mt-1 text-xs text-muted">
              {q
                ? 'Try a different name, email or phone number.'
                : 'Customers appear here as soon as they register or book.'}
            </p>
          </div>
        ) : (
          customers.map((c) => <CustomerRow key={c.id} customer={c} />)
        )}
      </div>
    </div>
  );
}
