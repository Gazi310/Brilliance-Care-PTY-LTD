import { Link } from 'react-router-dom';
import JobRow from '../JobRow.jsx';

/** Today's home visits (pickups, returns, cleans, deliveries), morning → evening. */
export default function TodayJobs({ jobs }) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-ink">Today</h2>
        <Link to="/admin/schedule" className="text-xs font-bold text-navy hover:underline">
          Open schedule →
        </Link>
      </div>

      <div className="mt-2.5 space-y-2">
        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white px-5 py-8 text-center">
            <p className="text-2xl">🌤️</p>
            <p className="mt-2 text-sm font-bold text-ink">No visits scheduled today</p>
            <p className="mt-1 text-xs text-muted">
              Pickups, returns, cleans and shop deliveries due today will line up here.
            </p>
          </div>
        ) : (
          jobs.map((j, i) => <JobRow key={`${j.orderId}-${j.window}-${i}`} job={j} />)
        )}
      </div>
    </section>
  );
}
