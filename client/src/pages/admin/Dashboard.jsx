import { Link } from 'react-router-dom';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';

const CARDS = [
  { to: '/admin/orders', title: 'Orders & bookings', desc: 'The work queue — assess jobs, send invoices, collect balances.' },
  { to: '/admin/services', title: 'Laundry services', desc: 'Edit laundry services, prices & delivery fee.' },
  { to: '/admin/cleaning', title: 'Cleaning services', desc: 'Edit cleaning services, prices & delivery fee.' },
  { to: '/admin/products', title: 'Shop', desc: 'Manage product inventory & delivery slots.' },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Admin"
        title="Dashboard"
        subtitle="Run the day from here. Schedule, customers and settings arrive in later phases."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5"
          >
            <p className="text-sm font-extrabold text-ink">{c.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{c.desc}</p>
            <span className="mt-3 inline-block text-xs font-bold text-navy">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
