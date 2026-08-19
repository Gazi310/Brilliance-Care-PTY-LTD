import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import CustomerProfileCard from '../../components/admin/customers/CustomerProfileCard.jsx';
import CustomerNotes from '../../components/admin/customers/CustomerNotes.jsx';
import CustomerOrderHistory from '../../components/admin/customers/CustomerOrderHistory.jsx';
import { adminGetCustomer, adminSetCustomerNote } from '../../services/adminService.js';
import { AlertIcon } from '../../components/admin/icons.jsx';
import { Button, Notice } from '../../components/ui';

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
    <AdminPage>
      <AdminSectionHeader
        eyebrow="Customers"
        title={data?.customer.name ?? 'Customer'}
        crumb={{
          to: '/admin/customers',
          label: 'All customers',
          current: data?.customer.name ?? '…',
        }}
      />

      {loading ? (
        <div className="space-y-5">
          <div className="bc-skeleton h-56 rounded-card" />
          <div className="bc-skeleton h-40 rounded-card" />
        </div>
      ) : error ? (
        <Notice tone="warn" icon={<AlertIcon className="mt-0.5 flex-none" />}>
          <p>{error}</p>
          <Button variant="ghost" onClick={load} className="mt-2">
            Retry
          </Button>
        </Notice>
      ) : data ? (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-3">
            <CustomerProfileCard customer={data.customer} />
            <CustomerOrderHistory orders={data.orders} />
          </div>
          <div className="lg:col-span-2">
            <CustomerNotes key={data.customer.id} customer={data.customer} onSave={saveNote} />
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
}
