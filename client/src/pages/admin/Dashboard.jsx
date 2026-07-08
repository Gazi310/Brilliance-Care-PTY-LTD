import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import KpiGrid from '../../components/admin/dashboard/KpiGrid.jsx';
import TodayJobs from '../../components/admin/dashboard/TodayJobs.jsx';
import NeedsAction from '../../components/admin/dashboard/NeedsAction.jsx';
import { getAdminStats } from '../../services/adminService.js';

const QUICK_LINKS = [
  { to: '/admin/orders', label: 'Orders queue' },
  { to: '/admin/schedule', label: 'Schedule' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/settings', label: 'Settings' },
];

/** /admin — the morning-glance dashboard (blueprint §5.1). */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setStats(await getAdminStats());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const todayLabel = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader eyebrow="Admin" title="Dashboard" subtitle={todayLabel} />

      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bc-skeleton h-[74px] rounded-2xl" />
            ))}
          </div>
          <div className="bc-skeleton h-40 rounded-2xl" />
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
      ) : (
        <>
          <KpiGrid kpis={stats.kpis} />
          <TodayJobs jobs={stats.todayJobs} />
          <NeedsAction needsAction={stats.needsAction} />

          {/* Quick jumps into the rest of the admin area */}
          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-navy shadow-soft transition hover:-translate-y-0.5"
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
