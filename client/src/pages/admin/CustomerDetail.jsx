import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CustomerProfileCard from '../../components/admin/customers/CustomerProfileCard.jsx';
import CustomerNotes from '../../components/admin/customers/CustomerNotes.jsx';
import CustomerOrderHistory from '../../components/admin/customers/CustomerOrderHistory.jsx';
import { adminGetCustomer, adminSetCustomerNote } from '../../services/adminService.js';

/** /admin/customers/:id — one customer's profile, notes and order history. */
export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await adminGetCustomer(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveNote = async (note) => {
    await adminSetCustomerNote(id, note);
    setData((d) => (d ? { ...d, customer: { ...d.customer, note } } : d));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        to="/admin/customers"
        className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-navy hover:underline"
      >
        ← All customers
      </Link>

      {loading ? (
        <div className="space-y-3">
          <div className="bc-skeleton h-48 rounded-2xl" />
          <div className="bc-skeleton h-32 rounded-2xl" />
        </div>
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
      ) : data ? (
        <div className="space-y-4">
          <CustomerProfileCard customer={data.customer} />
          <CustomerNotes key={data.customer.id} customer={data.customer} onSave={saveNote} />
          <CustomerOrderHistory orders={data.orders} />
        </div>
      ) : null}
    </div>
  );
}
