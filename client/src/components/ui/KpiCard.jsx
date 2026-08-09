/**
 * KpiCard — a single number on the admin dashboard.
 *
 * `delta` is optional and takes a sign: pass direction explicitly
 * rather than inferring it from the string, because "down 12%" is
 * good news for some metrics (missed pickups) and bad for others
 * (revenue). The component shouldn't be guessing which.
 */
export default function KpiCard({ label, value, delta, direction, className = '' }) {
  return (
    <div className={`rounded-card border border-line bg-white p-[22px] ${className}`}>
      <p className="text-[13px] font-semibold leading-[1.3] text-muted">{label}</p>
      <p className="mt-2 font-display text-[32px] font-bold leading-none text-navy-900">{value}</p>
      {delta && (
        <p
          className={`mt-2 text-[13px] font-semibold ${
            direction === 'up' ? 'text-ok' : direction === 'down' ? 'text-bad' : 'text-muted'
          }`}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
