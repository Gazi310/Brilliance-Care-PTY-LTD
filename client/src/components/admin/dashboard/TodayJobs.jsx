import JobRow from '../JobRow.jsx';
import { Panel, Button } from '../../ui';

/** Today's home visits (pickups, returns, cleans, deliveries), morning → evening. */
export default function TodayJobs({ jobs }) {
  return (
    <Panel
      as="h2"
      title="Today's jobs"
      action={
        <Button variant="ghost" to="/admin/schedule" className="text-sm">
          Full schedule →
        </Button>
      }
      padded
    >
      {jobs.length === 0 ? (
        <div className="rounded-card border border-dashed border-line px-6 py-10 text-center">
          <p className="bc-h4">No visits scheduled today</p>
          <p className="mx-auto mt-2 max-w-sm bc-meta text-muted">
            Pickups, returns, cleans and shop deliveries due today line up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {jobs.map((j, i) => (
            <JobRow key={`${j.orderId}-${j.window}-${i}`} job={j} />
          ))}
        </div>
      )}
    </Panel>
  );
}
