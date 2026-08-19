import { useEffect, useState } from 'react';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import KpiGrid from '../../components/admin/dashboard/KpiGrid.jsx';
import TodayJobs from '../../components/admin/dashboard/TodayJobs.jsx';
import NeedsAction from '../../components/admin/dashboard/NeedsAction.jsx';
import { getAdminStats } from '../../services/adminService.js';
import { AlertIcon } from '../../components/admin/icons.jsx';
import { Button, Notice } from '../../components/ui';

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
    <AdminPage>
      <AdminSectionHeader
        eyebrow={todayLabel}
        title="Dashboard"
        action={
          <>
            <Button variant="outline" size="sm" to="/admin/schedule">
              Open schedule
            </Button>
            <Button variant="gold" size="sm" to="/admin/orders">
              Work queue
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bc-skeleton h-[104px] rounded-card" />
            ))}
          </div>
          <div className="bc-skeleton h-56 rounded-card" />
          <div className="bc-skeleton h-56 rounded-card" />
        </div>
      ) : error ? (
        <Notice tone="warn" icon={<AlertIcon className="mt-0.5 flex-none" />}>
          <p>{error}</p>
          <Button variant="ghost" onClick={load} className="mt-2">
            Retry
          </Button>
        </Notice>
      ) : (
        <div className="space-y-5">
          <KpiGrid kpis={stats.kpis} />
          <NeedsAction needsAction={stats.needsAction} />
          <TodayJobs jobs={stats.todayJobs} />
        </div>
      )}
    </AdminPage>
  );
}
